'use strict';


angular.module('app').directive('vehiclePanel', function () {


	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/vehiclepanel.html',
		controller: 'VehiclePanelController'
	}
});
