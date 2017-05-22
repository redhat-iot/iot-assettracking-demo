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
package com.redhat.iot.cargodemo.rest;

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

