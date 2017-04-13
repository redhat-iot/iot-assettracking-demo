package com.redhat.iot.cargodemo.service;

import com.redhat.iot.cargodemo.model.*;
import org.infinispan.client.hotrod.RemoteCacheManager;
import org.infinispan.client.hotrod.configuration.ConfigurationBuilder;

import javax.enterprise.context.ApplicationScoped;
import java.util.Map;
import java.util.Properties;

@ApplicationScoped
public class DGService {

    private RemoteCacheManager cacheManager;

    public Map<String, Customer> getCustomers() {
        return cacheManager.getCache("customer");
    }
    public Map<String, Facility> getFacilities() {
        return cacheManager.getCache("facility");
    }
    public Map<String, Operator> getOperators() {
        return cacheManager.getCache("operator");
    }
    public Map<String, Shipment> getShipments() {
        return cacheManager.getCache("shipment");
    }
    public Map<String, Vehicle> getVehicles() {
        return cacheManager.getCache("vehicle");
    }

    public DGService() {


        String host = System.getenv("DATASTORE_HOST");
        if (host == null) {
            host = "localhost";
        }

        int port = 11333;
        String portStr = System.getenv("DATASTORE_PORT");
        if (portStr != null) {
            port = Integer.parseInt(portStr);
        }

        String cacheNames = System.getenv("DATASTORE_CACHE");
        if (cacheNames == null) {
            cacheNames = "customer,facility,operator,shipment,vehicle";
        }

        System.out.println("DG Proxy initializing to " + host + ":" + port + " cache:" + cacheNames);

        Properties props = new Properties();
        props.setProperty("infinispan.client.hotrod.protocol_version", "1.0");

        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.withProperties(props).addServer()
                .host(host)
                .port(port);
        cacheManager = new RemoteCacheManager(builder.build());

        System.out.println("DG Proxy connected to " + host + ":" + port + " preconfigured caches: " + cacheNames);

    }

}
