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
import java.util.*;

/**
 * A simple REST service which proxies requests to a local datagrid.
 *
 * @author jfalkner@redhat.com
 */

@Path("/utils")
@Singleton
public class UtilsEndpoint {

    public static final int MAX = 10;
    public static final int FAC_MAX = 4;
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


        facilitiesCache.clear();
        vehiclesCache.clear();
        customerCache.clear();
        operatorCache.clear();
        shipmentCache.clear();

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



        }
        for (int i = 0; i < FAC_MAX; i++) {
            facilitiesCache.put("Facility " + i,
                    new Facility("Facility " + i, addrs.get((int)(Math.floor(Math.random() * addrs.size()))),
                            new LatLng(-80.0, 20.0), Math.random() * 1000.0));

        }
        for (int i = 0; i < MAX; i++) {

            Vehicle v = new Vehicle("" + Math.random(), "Desc for Vehicle " + i);
            v.setOrigin(facilitiesCache.get("Facility " + ((int) (Math.floor(Math.random() * FAC_MAX)))));
            v.setDestination(facilitiesCache.get("Facility " + ((int) (Math.floor(Math.random() * FAC_MAX)))));
            List<Telemetry> vehicleTelemetry = new ArrayList<>();
            vehicleTelemetry.add(new Telemetry("°C", 300, 0.0, "Engine Temp", "Engine"));
            vehicleTelemetry.add(new Telemetry("rpm", 3500, 0.0, "RPM", "RPM"));
            vehicleTelemetry.add(new Telemetry("psi", 2000.0, 1000.0, "Oil Pressure", "Oil"));
            vehicleTelemetry.add(new Telemetry("days", 365, 0.0, "Days Since Tune-up", "Maint"));
            v.setTelemetry(vehicleTelemetry);
            vehiclesCache.put("Vehicle " + i, v);
        }

        for (int i = 0; i < MAX; i++) {
            List<Facility> route = new ArrayList<Facility>();
            for (int j = 0; j < 4; j++) {
                route.add(facilitiesCache.get("Facility " + ((int) (Math.floor(Math.random() * FAC_MAX)))));
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

        calcUtilization();

    }

    private void calcUtilization() {
        Map<String, Facility> facCache = dgService.getFacilities();
        Map<String, Shipment> shipCache = dgService.getShipments();

        Map<String, Integer> facCount = new HashMap<>();

        int total = 0;

        for (String s1 : shipCache.keySet()) {
            Shipment s = shipCache.get(s1);
            for (Facility f : s.getRoute()) {
                total++;
                if (facCount.containsKey(f.getName())) {
                    facCount.put(f.getName(), facCount.get(f.getName()) + 1);
                } else {
                    facCount.put(f.getName(), 1);
                }
            }
        }

        for (String s1 : facCache.keySet()) {
            Facility f = facCache.get(s1);
            f.setUtilization(2.5 * ((double)facCount.get(f.getName()) / (double)total));
            facCache.put(f.getName(), f);
        }
    }

    @PUT
    @Path("/{id}")
    public void put(@PathParam("id") String id, Vehicle value) {
        dgService.getVehicles().put(id, value);
    }

    @GET
    @Path("/summaries")
    @Produces({"application/json"})
    public List<Summary> getSummaries() {

        List<Summary> result = new ArrayList<>();

        Summary vehicleSummary = getVehicleSummary();
        Summary clientSummary = getClientSUmmary();
        Summary packageSummary = getPackageSummary();
        Summary facilitySummary = getFacilitySummary();
        Summary operatorSummary = getOperatorSummary();

        result.add(clientSummary);
        result.add(packageSummary);
        result.add(vehicleSummary);
        result.add(operatorSummary);
        result.add(facilitySummary);

        Summary mgrs = new Summary();
        mgrs.setName("fake");
        mgrs.setTitle("Managers");
        mgrs.setCount(23);
        mgrs.setWarningCount(4);
        mgrs.setErrorCount(1);
        result.add(mgrs);
        return result;
    }

    private Summary getOperatorSummary() {
        Map<String, Operator> cache = dgService.getOperators();

        Summary summary = new Summary();
        summary.setName("operators");
        summary.setTitle("Operators");
        summary.setCount(cache.keySet().size());

        return summary;

    }

    private Summary getFacilitySummary() {
        Map<String, Facility> cache = dgService.getFacilities();

        Summary summary = new Summary();
        summary.setName("facilities");
        summary.setTitle("Facilities");
        summary.setCount(cache.keySet().size());

        long warningCount =  cache.keySet().stream()
                .map(cache::get)
                .filter(v -> v.getUtilization() < .7 && v.getUtilization() > .5)
                .count();

        long errorCount =  cache.keySet().stream()
                .map(cache::get)
                .filter(v -> v.getUtilization() < .5)
                .count();

        summary.setWarningCount(warningCount);
        summary.setErrorCount(errorCount);

        return summary;
    }

    private Summary getPackageSummary() {
        Map<String, Shipment> cache = dgService.getShipments();

        Summary summary = new Summary();
        summary.setName("packages");
        summary.setTitle("Packages");
        summary.setCount(cache.keySet().size());


        long warningCount =  cache.keySet().stream()
                .map(cache::get)
                .filter(v -> v.getStatus() == Shipment.Status.WARNING)
                .count();

        long errorCount =  cache.keySet().stream()
                .map(cache::get)
                .filter(v -> v.getStatus() == Shipment.Status.ERROR)
                .count();

        summary.setWarningCount(warningCount);
        summary.setErrorCount(errorCount);
        return summary;

    }

    private Summary getClientSUmmary() {
        Map<String, Customer> cache = dgService.getCustomers();

        Summary summary = new Summary();
        summary.setName("clients");
        summary.setTitle("Clients");
        summary.setCount(cache.keySet().size());
        return summary;

    }

    private Summary getVehicleSummary() {
        Map<String, Vehicle> cache = dgService.getVehicles();

        Summary summary = new Summary();
        summary.setName("vehicles");
        summary.setTitle("Vehicles");
        summary.setCount(cache.keySet().size());


        long warningCount =  cache.keySet().stream()
                .map(cache::get)
                .filter(v -> v.getStatus() == Vehicle.Status.WARNING)
                .count();

        long errorCount =  cache.keySet().stream()
                .map(cache::get)
                .filter(v -> v.getStatus() == Vehicle.Status.ERROR)
                .count();

        summary.setWarningCount(warningCount);
        summary.setErrorCount(errorCount);
        return summary;
    }

}

