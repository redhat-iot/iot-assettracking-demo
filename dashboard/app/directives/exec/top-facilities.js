'use strict';


angular.module('app').directive('execTopFacilities', function () {


	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/exec/top-facilities.html',
		controller: 'ExecTopFacilitiesController'
	}
});
