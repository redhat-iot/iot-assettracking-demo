'use strict';


angular.module('app').directive('execMaintainEvents', function () {


	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/exec/maintain-events.html',
		controller: 'ExecMaintainEventsController'
	}
});
