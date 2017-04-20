'use strict';

var module = angular.module('app', ['ngRoute', 'ui.bootstrap', 'patternfly',
    'angular-websocket', 'ngMap', 'angularMoment', 'n3-line-chart','scrollable-table',
    'frapontillo.bootstrap-switch']);

angular.element(document).ready(function () {

    // get config
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");

    $http.get("config.json").then(function (response) {
        module.constant("APP_CONFIG", response.data);
        console.log("Bootstrapping system");
        angular.bootstrap(document, ["app"], {
            strictDi: true
        });
    });
});

