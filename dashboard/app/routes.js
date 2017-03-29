'use strict';

angular.module('app').config([ '$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl : 'partials/home.html',
    controller : 'HomeController'
  }).when('/exec', {
      templateUrl : 'partials/exec/home.html',
      controller : 'ExecHomeController'
  }).otherwise({
    redirectTo : '/'
  });
} ]);
