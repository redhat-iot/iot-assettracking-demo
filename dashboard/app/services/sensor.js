'use strict';

angular.module('app')

    .factory('SensorData', ['$http', '$filter', '$timeout', '$interval', '$rootScope', '$location', '$q', 'APP_CONFIG', 'Notifications', 'Reports',
        function ($http, $filter, $timeout, $interval, $rootScope, $location, $q, APP_CONFIG, Notifications, Reports) {
        var factory = {},
            client = null,
            msgproto = null,
            listeners = [],
            topicRegex = /Red-Hat\/([^\/]*)\/iot-demo\/([^\/]*)\/([^\/]*)$/,
            alertRegex = /Red-Hat\/([^\/]*)\/iot-demo\/([^\/]*)\/([^\/]*)\/alerts$/,
            metricOverrides = {};

            // Set the name of the hidden property and the change event for visibility
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            // If the page/tab is hidden, pause the data stream;
            // if the page/tab is shown, restart the stream
            function handleVisibilityChange() {
                if (document[hidden]) {
                    listeners.forEach(function(listener) {
                        client.unsubscribe(listener.topic);
                    });
                } else {
                    // doc played
                    listeners.forEach(function(listener) {
                        client.subscribe(listener.topic);
                    });
                }
            }

            // Warn if the browser doesn't support addEventListener or the Page Visibility API
            if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
                console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
            } else {
                // Handle page visibility change
                document.addEventListener(visibilityChange, handleVisibilityChange, false);
            }

        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:"+responseObject.errorMessage);
                Notifications.warn("Lost connection to broker, attempting to reconnect (" + responseObject.errorMessage);
                connectClient(1);

            }
        }

        function handleAlert(destination, alertObj) {

            if (alertObj.type == 'VEHICLE') {
                $rootScope.$broadcast('vehicle:alert', {
                    vin: alertObj.truckid,
                    message: $filter('date')(alertObj.date, 'medium') + ": " +
                                alertObj.desc + ": " + alertObj.message
                });
            } else if (alertObj.type == 'PACKAGE') {
                $rootScope.$broadcast('package:alert', {
                    vin: alertObj.truckid,
                    sensor_id: alertObj.sensorid,
                    message: $filter('date')(alertObj.date, 'medium') + ": " +
                                alertObj.desc + ": " + alertObj.message
                });
            }

            Reports.refresh();

        }

        function onMessageArrived(message) {
            var destination = message.destinationName;

            if (alertRegex.test(destination)) {
                handleAlert(destination, JSON.parse(message.payloadString));
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
                            var value =  (metricOverrides[listener.objId] && metricOverrides[listener.objId][telMetricName]) ?
                                (metricOverrides[listener.objId][telMetricName] * (.95 + 0.05 * Math.random())).toFixed(1) :
                                decodedMetric.doubleValue.toFixed(1);
                            if (telMetricName == decodedMetric.name) {
                                data.push({
                                    name: telName,
                                    value: value,
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

        function connectClient(attempt) {

            var MAX_ATTEMPTS = 100;

            if (attempt > MAX_ATTEMPTS) {
                Notifications.error("Cannot connect to broker after " + MAX_ATTEMPTS +" attempts, reload to retry");
                return;
            }

            if (attempt > 1) {
                Notifications.warn("Trouble connecting to broker, will keep trying (reload to re-start the count)");
            }
            var brokerHostname = APP_CONFIG.BROKER_WEBSOCKET_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1");
            client = new Paho.MQTT.Client(brokerHostname, Number(APP_CONFIG.BROKER_WEBSOCKET_PORT), "demo-client-" + guid());

            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;

            protobuf.load("kurapayload.proto", function(err, root) {
                if (err) throw err;

                msgproto = root.lookup("kuradatatypes.KuraPayload");
                // connect the client
                client.connect({
                    onSuccess: function() {
                        console.log("Connected to broker");
                        if (attempt > 1) {
                            Notifications.success("Connected to the IoT cloud!");
                        }
                        var topicName = "Red-Hat/+/iot-demo/+/+/alerts";
                        client.subscribe(topicName);
                    },
                    userName: APP_CONFIG.BROKER_USERNAME,
                    password: APP_CONFIG.BROKER_PASSWORD,
                    onFailure: function(err) {
                        console.log("Failed to connect to broker (attempt " + attempt + "), retrying. Error code:" + err.errorCode + " message:" + err.errorMessage);
                        $timeout(function() {
                            connectClient(attempt+1);
                        }, 10000);
                    }
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
                return ((!listener.vehicle) || (listener.vehicle.vin != vehicle.vin));
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
                    "query": {
                        "bool": {
                          "must": [
                            {
                              "term": {
                                "channel": "iot-demo/packages/" + pkg.sensor_id
                              }
                            }
                          ]
                        }
                    },
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

        function sendJSONObjectMsg(jsonObj, topic) {
            var message = new Paho.MQTT.Message(JSON.stringify(jsonObj));
            message.destinationName = topic;
            client.send(message);

        }

        function sendKuraMsg(kuraObj, topic) {
            var payload = msgproto.encode(kuraObj).finish();
            var message = new Paho.MQTT.Message(payload);
            message.destinationName = topic;
            client.send(message);

        }

        factory.cascadingAlert = function(vehicle) {

            var hitemp =
                {
                    timestamp: new Date().getTime(),
                    metric: [
                        {
                            name: 'temp',
                            type: 'DOUBLE',
                            doubleValue: 265
                        }
                    ]
                };

            var hipress =
                {
                    timestamp: new Date().getTime(),
                    metric: [
                        {
                            name: 'oilpress',
                            type: 'DOUBLE',
                            doubleValue: 95
                        }
                    ]
                };

            metricOverrides[vehicle.vin] = {};

            $interval(function() {
                metricOverrides[vehicle.vin]['temp'] = 265;
                sendKuraMsg(hitemp, 'Red-Hat/sim-truck/iot-demo/trucks/' + vehicle.vin)
            }, 5000);

            $timeout(function() {
                $interval(function() {
                    metricOverrides[vehicle.vin]['oilpress'] = 95;
                    sendKuraMsg(hipress, 'Red-Hat/sim-truck/iot-demo/trucks/' + vehicle.vin);
                }, 5000);
                var hitempalert = {
                    date: new Date().getTime(),
                    from: "Operations",
                    desc: "Truck Maintenance Required",
                    message: "Your vehicle is in need of maintenance. A maintenance crew has been dispatched to the " + vehicle.destination.name + " facility (bay 4), please arrive no later than 10:0am EDT",
                    type: 'VEHICLE',
                    truckid: vehicle.vin,
                    sensorid: null
                };

                sendJSONObjectMsg(hitempalert, 'Red-Hat/sim-truck/iot-demo/trucks/' + vehicle.vin + '/alerts');
            }, 10000);

        };

        factory.cascadingPkgAlert = function(vehicle, pkg) {

            var hipkgtemp =
                {
                    timestamp: new Date().getTime(),
                    metric: [
                        {
                            name: 'Ambient',
                            type: 'DOUBLE',
                            doubleValue: 42.2
                        }
                    ]
                };

            $timeout(function() {
                $interval(function() {
                    sendKuraMsg(hipkgtemp, 'Red-Hat/sim-truck/iot-demo/packages/' + pkg.sensor_id);
                    metricOverrides[pkg.sensor_id] = {};
                    metricOverrides[pkg.sensor_id]['Ambient'] = 42.2;
                }, 5000);
            }, 5000);


            $timeout(function() {
                var hitempalert = {
                    date: new Date().getTime(),
                    from: "Operations",
                    desc: "Client Package Alert",
                    message: 'Temperature on package ' + pkg.sensor_id + ' (' + pkg.desc + ' for client ' + pkg.customer.name + ') on shelf 12 is out of spec (42.2°C), please verify condition',
                    type: 'PACKAGE',
                    truckid: vehicle.vin,
                    sensorid: pkg.sensor_id
                };

                sendJSONObjectMsg(hitempalert, 'Red-Hat/sim-truck/iot-demo/packages/' + pkg.sensor_id + '/alerts');

            }, 8000);

        };

            connectClient(1);
        return factory;
    }]);
