package com.redhat.iot.cargodemo.rest;/*
 * JBoss, Home of Professional Open Source
 * Copyright 2015, Red Hat, Inc. and/or its affiliates, and individual
 * contributors by the @authors tag. See the copyright.txt in the
 * distribution for a full listing of individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import com.redhat.iot.cargodemo.model.Alert;
import com.redhat.iot.cargodemo.model.Vehicle;
import com.redhat.iot.cargodemo.service.AlertsService;
import com.redhat.iot.cargodemo.service.DGService;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A simple REST service which proxies requests to a local datagrid.
 *
 * @author jfalkner@redhat.com
 */

@Path("/vehicles")
@Singleton
public class VehiclesEndpoint {

    @Inject
    DGService dgService;

    @Inject
    AlertsService alertsService;

    @GET
    @Path("/{id}")
    @Produces({"application/json"})
    public Vehicle get(@PathParam("id") String id) {
        return dgService.getVehicles().get(id);
    }

    @PUT
    @Path("/{id}")
    public void put(@PathParam("id") String id, Vehicle value) {
        dgService.getVehicles().put(id, value);
    }

    @GET
    @Path("/")
    @Produces({"application/json"})
    public List<Vehicle> getAll() {

        Map<String, Vehicle> cache = dgService.getVehicles();

        return cache.keySet().stream()
            .map(cache::get)
            .collect(Collectors.toList());

    }

    @GET
    @Path("/{vin}/alerts")
    @Produces({"application/json"})
    public List<Alert> getAlerts(@PathParam("vin") String vin) {

        Map<String, Vehicle> cache = dgService.getVehicles();
        List<Alert> alerts = alertsService.getAlerts();

        Vehicle v = cache.get(vin);

        List<Alert> finalAlerts = alerts.stream()
                .filter(a -> vin.equals(a.getVin()))
                .collect(Collectors.toList());

        alertsService.clearAlertsForVehicle(v);

        return finalAlerts;
    }


}

