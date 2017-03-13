'use strict';

angular.module('app')

    .factory('SensorData', ['$http', '$q', 'APP_CONFIG', 'Notifications', function ($http, $q, APP_CONFIG, Notifications) {
        var factory = {},
            client = null,
            msgproto = null,
            listeners = [];

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
            console.log("message destname: " + message.destinationName);
            var destination = message.destinationName;
            var payload = message.payloadBytes;
            var decoded =  msgproto.decode(payload);

            // {"metric":[
            //   {"name":"Ambient","type":"FLOAT","floatValue":18.6299991607666},
            //   {"name":"Light","type":"FLOAT","floatValue":269.45001220703125},
            //   {"name":"Humidity","type":"FLOAT","floatValue":15.34000015258789}
            // ]}

            listeners.filter(function(listener) {
                return listener.topic == destination;
            }).forEach(function(listener) {
                var targetObj = listener.package || listener.vehicle;
                var cb = listener.listener;

                var data = [];

                decoded.metric.forEach(function(decodedMetric) {
                    targetObj.telemetry.forEach(function(objTel) {
                        var telName = objTel.name;
                        var telMetricName = objTel.metricName;
                        if (telMetricName == decodedMetric.name) {
                            data.push({
                                name: telName,
                                value: decodedMetric.floatValue.toFixed(1),
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
            client = new Paho.MQTT.Client(APP_CONFIG.BROKER_WEBSOCKET_HOSTNAME, Number(APP_CONFIG.BROKER_WEBSOCKET_PORT), "demo-client-id");

            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;

            protobuf.load("kurapayload.proto", function(err, root) {
                if (err) throw err;

                msgproto = root.lookup("kuradatatypes.KuraPayload");
                console.log("proto: " + msgproto);
                // connect the client
                client.connect({
                    onSuccess:onConnect,
                    userName: APP_CONFIG.BROKER_USERNAME,
                    password: APP_CONFIG.BROKER_PASSWORD
                });
            });
        }
        // factory.publish = function(topic, payload, onSuccess, onError) {
        //     $http({
        //         method: 'POST',
        //         url: APP_CONFIG.EDC_REST_ENDPOINT + '/messages/publish',
        //         headers: {
        //             'Authorization': auth
        //         },
        //         data: {
        //             topic: topic,
        //             payload: payload
        //         }
        //
        //     }).then(function(response) {
        //         onSuccess();
        //     }, function (response) {
        //         onError(response);
        //     });
        // };

        factory.subscribePkg = function (pkg, listener) {

            var topicName = "Red-Hat/demo-gw-vm/demo-kit/assets/" + pkg.sensor_id;
            client.subscribe(topicName);
            console.log("subscribed to " + topicName);
            listeners.push({
                package: pkg,
                topic: topicName,
                listener: listener
            });
        };

        factory.subscribeVehicle = function (vehicle, listener) {

            var topicName = "Red-Hat/demo-gw-vm/demo-kit/assets/" + vehicle.vin;
            client.subscribe(topicName);
            console.log("subscribed to vehicle " + topicName);
            listeners.push({
                vehicle: vehicle,
                topic: topicName,
                listener: listener
            });
        };

        factory.unsubscribeVehicle = function (vehicle) {
            
            // sockets = sockets.filter(function (socket) {
            //     if (socket.topic == topic) {
            //         if (socket.interval) {
            //             clearInterval(socket.interval);
            //         }
            //         return false;
            //     } else {
            //         return true;
            //     }
            // })
        };

        factory.unsubscribeAll = function () {
            // atmosphere.unsubscribe();
            // sockets.forEach(function (socket) {
            //     if (socket.interval) {
            //         clearInterval(socket.interval);
            //     }
            // });
            //
            // sockets = [];
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
