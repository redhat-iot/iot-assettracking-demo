'use strict';


angular.module('app').directive('execFacilityUtilization', function () {


	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/exec/facility-utilization.html',
		controller: 'ExecFacilityUtilizationController'
	}
});
