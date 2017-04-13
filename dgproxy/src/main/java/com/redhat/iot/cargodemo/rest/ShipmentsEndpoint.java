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

import com.redhat.iot.cargodemo.model.Shipment;
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

@Path("/shipments")
@Singleton
public class ShipmentsEndpoint {

    @Inject
    DGService dgService;

    @GET
    @Path("/")
    @Produces({"application/json"})
    public List<Shipment> getAll() {
        Map<String, Shipment> cache = dgService.getShipments();
        return cache.keySet().stream()
                .map(cache::get)
                .collect(Collectors.toList());

    }
    @GET
    @Path("/{vin}")
    @Produces({"application/json"})
    public List<Shipment> get(@PathParam("vin") String vin) {

        Map<String, Shipment> cache = dgService.getShipments();

        // TODO: use DG queries properly
        return cache.keySet().stream()
                .map(cache::get)
                .filter(shipment -> vin.equals(shipment.getCur_vehicle().getVin()))
                .collect(Collectors.toList());
    }


}

