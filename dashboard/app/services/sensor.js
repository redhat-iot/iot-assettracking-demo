'use strict';

angular.module('app')

    .factory('SensorData', ['$http', '$rootScope', '$location', '$q', 'APP_CONFIG', 'Notifications', 'Vehicles', 'Shipments',
        function ($http, $rootScope, $location, $q, APP_CONFIG, Notifications, Vehicles, Shipments) {
        var factory = {},
            client = null,
            msgproto = null,
            listeners = [],
            topicRegex = /Red-Hat\/([^\/]*)\/iot-demo\/([^\/]*)\/([^\/]*)$/,
            alertRegex = /Red-Hat\/([^\/]*)\/iot-demo\/([^\/]*)\/([^\/]*)\/alerts$/;

            function setFromISO8601(isostr) {
            var parts = isostr.match(/\d+/g);
            return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
        }

        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:"+responseObject.errorMessage);
            }
        }

        function handleAlert(destination, alertPayload) {
            var matches = alertRegex.exec(destination);
            var objType = matches[2];
            var objId = matches[3];

            switch (objType) {
                case 'trucks':
                    $rootScope.$broadcast('vehicle:alert', {
                        vin: objId
                    });
                    break;
                case 'packages':
                    Shipments.getAllShipments(function(allShipments) {
                        console.log("got ALL shipments (" + allShipments.length + ")");
                        allShipments.forEach(function(shipment) {
                            if (shipment.sensor_id == objId) {
                                console.log("broadcasting alert ");
                                $rootScope.$broadcast('package:alert', {
                                    vin: shipment.cur_vehicle.vin,
                                    sensor_id: objId
                                });
                            }
                        });
                    });
                    break;
                default:
                    console.log("ignoring alert: " + destination);
            }

        }

        var count = 1;
        function onMessageArrived(message) {
            var destination = message.destinationName;
            console.log(count++ + "RECEIVED on " + destination);

            if (alertRegex.test(destination)) {
                handleAlert(destination, decoded);
            } else {
                var payload = message.payloadBytes;
                var decoded =  msgproto.decode(payload);
                var matches = topicRegex.exec(destination);
                var objType = matches[2];
                var objId = matches[3];

                listeners.filter(function(listener) {
                    return (listener.objType == objType && listener.objId == objId);
                }).forEach(function(listener) {
                    var targetObj = listener.pkg || listener.vehicle;
                    var cb = listener.listener;

                    var data = [];

                    decoded.metric.forEach(function(decodedMetric) {
                        targetObj.telemetry.forEach(function(objTel) {
                            var telName = objTel.name;
                            var telMetricName = objTel.metricName;
                            if (telMetricName == decodedMetric.name) {
                                data.push({
                                    name: telName,
                                    value: decodedMetric.doubleValue.toFixed(1),
                                    timestamp: new Date()
                                });
                            }
                        });
                    });

                    cb(data);
                });
            }
        }

        function onConnect() {
            console.log("Connected to server");
            var topicName = "Red-Hat/+/iot-demo/+/+/alerts";
            client.subscribe(topicName);

        }

        function connectClient() {

            var brokerHostname = APP_CONFIG.BROKER_WEBSOCKET_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1");
            client = new Paho.MQTT.Client(brokerHostname, Number(APP_CONFIG.BROKER_WEBSOCKET_PORT), "demo-client-" + guid());

            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;

            protobuf.load("kurapayload.proto", function(err, root) {
                if (err) throw err;

                msgproto = root.lookup("kuradatatypes.KuraPayload");
                // connect the client
                client.connect({
                    onSuccess:onConnect,
                    userName: APP_CONFIG.BROKER_USERNAME,
                    password: APP_CONFIG.BROKER_PASSWORD
                });
            });
        }

        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        factory.subscribePkg = function (pkg, listener) {

            var topicName = "Red-Hat/+/iot-demo/packages/" + pkg.sensor_id;
            client.subscribe(topicName);
            console.log("subscribed to " + topicName);
            listeners.push({
                pkg: pkg,
                topic: topicName,
                objType: 'packages',
                objId: pkg.sensor_id,
                listener: listener
            });
        };

        factory.subscribeVehicle = function (vehicle, listener) {

            var topicName = "Red-Hat/+/iot-demo/trucks/" + vehicle.vin;
            client.subscribe(topicName);
            console.log("subscribed to " + topicName);
            listeners.push({
                vehicle: vehicle,
                topic: topicName,
                objType: 'trucks',
                objId: vehicle.vin,
                listener: listener
            });
        };

        factory.unsubscribeVehicle = function (vehicle) {
            var topicName = "Red-Hat/+/iot-demo/trucks/" + vehicle.vin;
            client.unsubscribe(topicName);
            console.log("UNsubscribed to " + topicName);
            listeners = listeners.filter(function(listener) {
                return ((!listener.vehicle) | (listener.vehicle.vin != vehicle.vin));
            });
        };

        factory.unsubscribePackage = function (pkg) {
            var topicName = "Red-Hat/+/iot-demo/packages/" + pkg.sensor_id;
            client.unsubscribe(topicName);
            console.log("UNsubscribed to " + topicName);
            listeners = listeners.filter(function(listener) {
                return ((!listener.pkg)  || (listener.pkg.sensor_id != pkg.sensor_id));
            });
        };


        factory.unsubscribeAll = function () {
            listeners.forEach(function(listener) {
               client.unsubscribe(listener.topic);
            });

            listeners = [];
        };

        factory.getRecentData = function (pkg, telemetry, cb) {

            var esUrl = "http://" + APP_CONFIG.ES_HOSTNAME + '.' +
                $location.host().replace(/^.*?\.(.*)/g,"$1") + ':' + APP_CONFIG.ES_PORT + '/_search';

            $http({
                method: 'POST',
                url: esUrl,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {
                    "size": 0,
                    "aggs": {
                        "my_date_histo": {
                            "date_histogram": {
                                "field": "timestamp",
                                "interval": "5m"
                            },
                            "aggs": {
                                "the_avg": {
                                    "avg": {
                                        "field": "metrics." + telemetry.metricName + ".dbl"
                                    }
                                },
                                "the_movavg": {
                                    "moving_avg": {
                                        "buckets_path": "the_avg"
                                    }
                                }
                            }
                        }
                    }
                }
            }).then(function successCallback(response) {

                if (!response.data) {
                    cb([]);
                    return;
                }

                var recentData = [];
                response.data.aggregations.my_date_histo.buckets.forEach(function (bucket) {
                    if (bucket.the_movavg) {
                        recentData.push({
                            timestamp: bucket.key,
                            value: bucket.the_movavg.value
                        });
                    }
                });
                cb(recentData);
            }, function errorCallback(response) {
                Notifications.error("error fetching recent data: " + response.statusText);
            });


        };


        connectClient();
        return factory;
    }]);
