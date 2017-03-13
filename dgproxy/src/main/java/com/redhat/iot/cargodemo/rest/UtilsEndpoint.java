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

import com.redhat.iot.cargodemo.model.*;
import com.redhat.iot.cargodemo.service.DGService;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A simple REST service which proxies requests to a local datagrid.
 *
 * @author jfalkner@redhat.com
 */

@Path("/utils")
@Singleton
public class UtilsEndpoint {

    public static final int MAX = 10;
    @Inject
    DGService dgService;

    @POST
    @Path("/resetAll")
    public void resetAll() {

        Map<String, Vehicle> vehiclesCache = dgService.getVehicles();
        Map<String, Customer> customerCache = dgService.getCustomers();
        Map<String, Facility> facilitiesCache = dgService.getFacilities();
        Map<String, Operator> operatorCache = dgService.getOperators();
        Map<String, Shipment> shipmentCache = dgService.getShipments();

        List<String> addrs = new ArrayList<>();
        addrs.add("Orlando, FL");
        addrs.add("Kissimmee, FL");
        addrs.add("Gainesville, FL");
        addrs.add("Daytona Beach, FL");
        addrs.add("Port Orange, FL");
        addrs.add("Miami, FL");
        addrs.add("Jacksonville, FL");
        addrs.add("Oviedo, FL");
        addrs.add("Winter Springs, FL");

        for (int i = 0; i < MAX; i++) {
            customerCache.put("Customer " + i,
                    new Customer("Customer + " + i, "customer" + i));
            operatorCache.put("Operator " + i,
                    new Operator("Operator " + i, "operator"+i));


            facilitiesCache.put("Facility " + i,
                    new Facility("Facility " + i, addrs.get((int)(Math.floor(Math.random() * addrs.size()))),
                            new LatLng(-80.0, 20.0)));

        }
        for (int i = 0; i < MAX; i++) {



            Vehicle v = new Vehicle("" + Math.random(), "Desc for Vehicle " + i);
            v.setOrigin(facilitiesCache.get("Facility " + ((int) (Math.floor(Math.random() * MAX)))));
            v.setDestination(facilitiesCache.get("Facility " + ((int) (Math.floor(Math.random() * MAX)))));
            List<Telemetry> vehicleTelemetry = new ArrayList<>();
            vehicleTelemetry.add(new Telemetry("°C", 300, 0.0, "Engine Temp", "Engine"));
            vehicleTelemetry.add(new Telemetry("rpm", 3500, 0.0, "RPM", "RPM"));
            vehicleTelemetry.add(new Telemetry("psi", 2000.0, 1000.0, "Oil Pressure", "Oil"));
            vehicleTelemetry.add(new Telemetry("days", 365, 0.0, "Days Since Tune-up", "Maint"));
            v.setTelemetry(vehicleTelemetry);
            vehiclesCache.put("Vehicle " + i, v);

            List<Facility> route = new ArrayList<Facility>();
            for (int j = 0; j < 4; j++) {
                route.add(facilitiesCache.get("Facility " + ((int) (Math.floor(Math.random() * MAX)))));
            }

            List<Telemetry> telemetry = new ArrayList<>();
            telemetry.add(new Telemetry("°C", 100.0, 0.0, "Temperature", "Ambient"));
            telemetry.add(new Telemetry("%", 100.0, 0.0, "Humidity", "Humidity"));
            telemetry.add(new Telemetry("lm", 2000.0, 1000.0, "Light", "Light"));

            Shipment s = new Shipment(customerCache.get("Customer " + i), "PKG" + i, "Shipment for customer " + i,
                    "B0:B4:48:00:00:08", route, new Date(), new Date(), 22.2,
                    vehiclesCache.get("Vehicle " + ((int) (Math.floor(Math.random() * MAX)))));

            s.setTelemetry(telemetry);
            shipmentCache.put("Shipment " + i, s);
        }



    }

    @PUT
    @Path("/{id}")
    public void put(@PathParam("id") String id, Vehicle value) {
        dgService.getVehicles().put(id, value);
    }

    @GET
    @Path("/all")
    @Produces({"application/json"})
    public List<Vehicle> getAll() {

        Map<String, Vehicle> cache = dgService.getVehicles();

        return cache.keySet().stream()
            .map(cache::get)
            .collect(Collectors.toList());

    }

}

