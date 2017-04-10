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
            // {"metric":[
            //   {"name":"Ambient","type":"FLOAT","floatValue":18.6299991607666},
            //   {"name":"Light","type":"FLOAT","floatValue":269.45001220703125},
            //   {"name":"Humidity","type":"FLOAT","floatValue":15.34000015258789}
            // ]}
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

        factory.getRecentData = function (pkgId, metric, startTime, endTime, limit, cb) {
            // $http({
            //     method: 'GET',
            //     url: APP_CONFIG.EDC_REST_ENDPOINT + '/messages/searchByTopic?' +
            //     'topic=' + pkgId +
            //     '&startDate=' +startTime +
            //     '&endDate=' +endTime +
            //     '&limit=' + limit,
            //     headers: {
            //         'Authorization': auth
            //     }
            // }).then(function successCallback(response) {
            //
            //
            //     var recentData = [];
            //     if (!response.data.message) {
            //         cb([]);
            //         return;
            //     }
            //     response.data.message.forEach(function (msg) {
            //         var timestamp = setFromISO8601(msg.receivedOn);
            //         msg.payload.metrics.metric.forEach(function (metricObj) {
            //             if (metricObj.name.toLowerCase() == metric) {
            //                 var dataObj = {
            //                     timestamp: timestamp.getTime()
            //                 };
            //                 dataObj[metricObj.name.toLowerCase()] = metricObj.value;
            //                 recentData.push(dataObj);
            //             }
            //         });
            //     });
            //
            //     cb(recentData);
            // }, function errorCallback(response) {
            //     Notifications.error("error fetching recent data: " + response.statusText);
            // });


        };


        connectClient();
        return factory;
    }]);
