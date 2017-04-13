'use strict';


angular.module('app').directive('execTopFacilities', function () {


	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/exec/top-facilities.html',
		controller: 'ExecTopFacilitiesController'
	}
});
