'use strict';

angular.module('app')

.factory('Shipments', ['$rootScope', '$location', '$http', '$q', 'APP_CONFIG', 'Notifications',
    function($rootScope, $location, $http, $q, APP_CONFIG, Notifications) {

	var factory = {},
		shipments = [],
		configRestEndpoint = "http://" + APP_CONFIG.DATASTORE_REST_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1") + '/api/shipments';


	factory.getShipments = function(vehicle, cb) {
        // get config
        $http({
            method: 'GET',
            url: configRestEndpoint + '/' + vehicle.vin
        }).then(function (response) {
            shipments = response.data;
            if ((shipments == undefined) || (shipments.constructor !== Array)) {
                Notifications.error("Error fetching Shipments for vehicle:" + vehicle.vin + " (invalid data). Reload to retry");
                return;
            }

            $rootScope.$broadcast('shipments:updated', vehicle);
            cb(shipments);

        }, function err(response) {
            console.log(JSON.stringify(response));
            Notifications.error("Error fetching Shipments for vehicle: " + vehicle.vin + ". Reload to retry");
        });

    };

	return factory;
}]);
