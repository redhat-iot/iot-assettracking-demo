'use strict';

angular.module('app')

.factory('Reports', ['$rootScope', '$location', '$http', '$q', 'APP_CONFIG', 'Notifications',
    function($rootScope, $location, $http, $q, APP_CONFIG, Notifications) {

	var factory = {},
        summaries = [],
        facilities = [],

		configRestEndpoint = "http://" + APP_CONFIG.DATASTORE_REST_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1") + '/api';


	factory.getSummaries = function() {
		return summaries;
	};

	factory.getShipCount = function() {
	    var shipCount = 0;
	    summaries.forEach(function(summary) {
	        if (summary.name == 'packages') {
	            shipCount = summary.count;
            }
        });
	    console.log("shipments to count: " + JSON.stringify(summaries));
	    return shipCount;
    };
	factory.getFacilities = function() {
	    return facilities;
    };

	factory.refresh = function() {

        // get summaries
        $http({
            method: 'GET',
            url: configRestEndpoint + '/utils/summaries'
        }).then(function (response) {
            summaries = response.data;
            if ((summaries == undefined) || (summaries.constructor !== Array)) {
                Notifications.error("Error fetching Summaries  (invalid data). Reload to retry");
                return;
            }

            $rootScope.$broadcast('summaries:updated', summaries);

        }, function err(response) {
            console.log(JSON.stringify(response));
            Notifications.error("Error fetching Summaries Configuration from [" + response.config.url + "]. Reload to retry");
        });

        // get  facilities
        $http({
            method: 'GET',
            url: configRestEndpoint + '/facilities/all'
        }).then(function (response) {
            facilities = response.data;
            if ((facilities == undefined) || (facilities.constructor !== Array)) {
                Notifications.error("Error fetching Facilities (invalid data). Reload to retry");
                return;
            }

            $rootScope.$broadcast('facilities:updated', facilities);

        }, function err(response) {
            console.log(JSON.stringify(response));
            Notifications.error("Error fetching Facilities from [" + response.config.url + "]. Reload to retry");
        });

    };

	factory.refresh();

	return factory;
}]);
