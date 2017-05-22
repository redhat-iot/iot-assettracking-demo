/*
 * ******************************************************************************
 * Copyright (c) 2017 Red Hat, Inc. and others
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Red Hat Inc. - initial API and implementation
 *
 * ******************************************************************************
 */

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
            url: configRestEndpoint + '/facilities'
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
