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

import com.redhat.iot.cargodemo.model.Customer;
import com.redhat.iot.cargodemo.service.DGService;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A simple REST service which proxies requests to a local datagrid.
 */

@Path("/customer")
@Singleton
public class CustomerEndpoint {

    @Inject
    DGService dgService;

    @GET
    @Path("/{id}")
    @Produces({"application/json"})
    public Customer getCustomer(@PathParam("id") String id) {
        return dgService.getCustomers().get(id);
    }

    @PUT
    @Path("/{id}")
    public void putCustomer(@PathParam("id") String id, Customer value) {
        dgService.getCustomers().put(id, value);
    }

    @GET
    @Path("/")
    @Produces({"application/json"})
    public List<Customer> getAllCustomers() {

        Map<String, Customer> cache = dgService.getCustomers();

        return cache.keySet().stream()
            .map(cache::get)
            .collect(Collectors.toList());

    }

}

