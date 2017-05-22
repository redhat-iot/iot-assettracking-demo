/*
 * ******************************************************************************
 * Copyright (c) 2017 Red Hat, Inc. and others
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Red Hat Inc. - initial API and implementation
 *
 * ******************************************************************************
 */

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

