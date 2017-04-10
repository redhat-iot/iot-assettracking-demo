'use strict';

angular.module('app')

.factory('Vehicles', ['$rootScope', '$location', '$http', '$q', 'APP_CONFIG', 'Notifications', function($rootScope, $location, $http, $q, APP_CONFIG, Notifications) {

	var factory = {},
		vehicles = [],
		configRestEndpoint = "http://" + APP_CONFIG.DATASTORE_REST_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1") + '/api/vehicles';


	factory.getVehicles = function() {
		return vehicles;
	};

	factory.reset = function() {

        // get config
        $http({
            method: 'GET',
            url: configRestEndpoint + "/"
        }).then(function (response) {
            vehicles = response.data;
            console.log("vehicles: " + JSON.stringify(vehicles));
            if ((vehicles == undefined) || (vehicles.constructor !== Array)) {
                Notifications.error("Error fetching Vehicle Configuration (invalid data). Reload to retry");
                return;
            }

            $rootScope.$broadcast('vehicles:updated');

            // currentShipments = currentShipments.filter(function(shipment) {
            //     return shipment.pkgId;
            // });

        }, function err(response) {
            console.log(JSON.stringify(response));
            Notifications.error("Error fetching Vehicle Configuration from [" + response.config.url + "]. Reload to retry");
        });

    };

	factory.reset();

	return factory;
}]);
