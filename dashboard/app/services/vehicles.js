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

.factory('Vehicles', ['$rootScope', '$location', '$http', '$q', 'APP_CONFIG', 'Notifications', function($rootScope, $location, $http, $q, APP_CONFIG, Notifications) {

	var factory = {},
		vehicles = [],
		configRestEndpoint = "http://" + APP_CONFIG.DATASTORE_REST_HOSTNAME + '.' + $location.host().replace(/^.*?\.(.*)/g,"$1") + '/api/vehicles';


	factory.getVehicles = function() {
		return vehicles;
	};


    // this.getIconName = function(type) {
    //     if (type == 'danger') {
    //         return 'pficon-error-circle-o';
    //     } else if (type == 'warning') {
    //         return 'pficon-warning-triangle-o';
    //     } else if (type == 'info') {
    //         return 'pficon-info';
    //     } else if (type == 'success') {
    //         return 'pficon-ok'
    //     }
    // }

    factory.reset = function() {

        // get config
        $http({
            method: 'GET',
            url: configRestEndpoint + "/"
        }).then(function (response) {
            vehicles = response.data;
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
