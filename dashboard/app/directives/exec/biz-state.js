'use strict';


angular.module('app').directive('execBizState', function () {


	return {
		restrict: 'E',
		scope: true,
		replace: true,
		templateUrl: 'partials/exec/biz-state.html',
		controller: 'ExecBizStateController'
	}
});
