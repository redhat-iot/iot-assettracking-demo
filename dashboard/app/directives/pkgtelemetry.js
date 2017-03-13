'use strict';


angular.module('app').directive('pkgTelemetry', function () {


    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/pkgtelemetry.html',
        controller: 'PkgTelemetryController'
    }
});
