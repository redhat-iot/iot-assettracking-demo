'use strict';


angular.module('app').directive('alertList', function () {


	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/alertlist.html',
		controller: 'AlertListController'
	}
});
