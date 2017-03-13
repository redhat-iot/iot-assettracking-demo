'use strict';


angular.module('app').directive('mapChart', function () {


    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/mapchart.html',
        controller: 'MapController'
    }
});
