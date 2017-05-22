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

.factory('Shipments', ['$rootScope', '$location', '$http', '$q', 'APP_CONFIG', 'Notifications',
    function($rootScope, $location, $http, $q, APP_CONFIG, Notifications) {

	var factory = {},
		shipments = [],
        allShipments = [],
		configRestEndpoint = "http://" + APP_CONFIG.DATASTORE_REST_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1") + '/api/shipments';

	    factory.getCurrentShipments = function() {
	        return shipments;
        };

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

                cb(shipments);

            }, function err(response) {
                console.log(JSON.stringify(response));
                Notifications.error("Error fetching Shipments for vehicle: " + vehicle.vin + ". Reload to retry");
            });

        };

        factory.getAllShipments = function(cb) {
            // get config
            $http({
                method: 'GET',
                url: configRestEndpoint
            }).then(function (response) {
                allShipments = response.data;
                if ((allShipments == undefined) || (allShipments.constructor !== Array)) {
                    Notifications.error("Error fetching ALL Shipments (invalid data). Reload to retry");
                    return;
                }

                cb(allShipments);

            }, function err(response) {
                console.log(JSON.stringify(response));
                Notifications.error("Error fetching ALL Shipments. Reload to retry");
            });

        };

        return factory;
}]);
