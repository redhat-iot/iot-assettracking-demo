'use strict';


angular.module('app').directive('execBizState', function () {


	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/exec/biz-state.html',
		controller: 'ExecBizStateController'
	}
});
