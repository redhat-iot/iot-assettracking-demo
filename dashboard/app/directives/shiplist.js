'use strict';


angular.module('app').directive('shipList', function () {


	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'partials/shiplist.html',
		controller: 'ShipListController',
		link: function postLink(scope, element, attrs) {
			element.find('[data-toggle="tooltip"]').tooltip()

		}
	}
});
