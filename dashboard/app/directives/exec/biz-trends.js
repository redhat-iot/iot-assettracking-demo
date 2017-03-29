'use strict';


angular.module('app').directive('execBizTrends', function () {


	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/exec/biz-trends.html',
		controller: 'ExecBizTrendsController'
	}
});
