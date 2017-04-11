'use strict';

angular.module('app')

    .factory('SensorData', ['$http', '$location', '$q', 'APP_CONFIG', 'Notifications',
        function ($http, $location, $q, APP_CONFIG, Notifications) {
        var factory = {},
            client = null,
            msgproto = null,
            listeners = [],
            topicRegex = /Red-Hat\/([^\/]*)\/iot-demo\/([^\/]*)\/([^\/]*)$/;


            function setFromISO8601(isostr) {
            var parts = isostr.match(/\d+/g);
            return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
        }

        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:"+responseObject.errorMessage);
            }
        }

        function onMessageArrived(message) {
            var destination = message.destinationName;
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

        function onConnect() {
            console.log("Connected to server");
        }

        function connectClient() {

            var brokerHostname = APP_CONFIG.BROKER_WEBSOCKET_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1");
            client = new Paho.MQTT.Client(brokerHostname, Number(APP_CONFIG.BROKER_WEBSOCKET_PORT), "demo-client-id");

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

        factory.subscribePkg = function (pkg, listener) {

            var topicName = "Red-Hat/+/iot-demo/packages/" + pkg.sensor_id;
            client.subscribe(topicName);
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
            listeners = listeners.filter(function(listener) {
                return (listener.vehicle.vin != vehicle.vin);
            });
        };

        factory.unsubscribePackage = function (pkg) {
            var topicName = "Red-Hat/+/iot-demo/packages/" + pkg.sensor_id;
            client.unsubscribe(topicName);
            listeners = listeners.filter(function(listener) {
                return (listener.pkg.sensor_id != pkg.sensor_id);
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
