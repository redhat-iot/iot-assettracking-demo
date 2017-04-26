package com.redhat.iot.cargodemo.service;

import com.redhat.iot.cargodemo.model.*;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.json.JSONObject;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.Initialized;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import java.util.*;

@ApplicationScoped
public class AlertsService implements MqttCallback {

    final private List<Alert> alerts = Collections.synchronizedList(new ArrayList<>());

    public static final int MAX_RECONNECT_ATTEMPTS = 100;

    @Inject
    DGService dgService;

    public AlertsService() {

    }

    public void addAlert(Alert alert) {
        alerts.add(alert);
    }

    public List<Alert> getAlerts() {
        return alerts;
    }

    public void clearAlerts() {
        alerts.clear();
    }

    public void clearAlertsForVehicle(Vehicle v) {
        synchronized (alerts) {
            List<Alert> toRemove = new ArrayList<>();
            for (Alert alert : alerts) {
                if (alert.getTruckid().equals(v.getVin())) {
                    toRemove.add(alert);
                }
            }
            for (Alert toRemoveAlert: toRemove) {
                alerts.remove(toRemoveAlert);
            }
        }
    }

    public void init(@Observes @Initialized(ApplicationScoped.class) Object init) {

        subscribeToAlerts();

    }


    private void subscribeToAlerts() {
        MemoryPersistence persistence = new MemoryPersistence();
        String broker = "tcp://kapua-broker:1883";

        for (int i = 0; i < MAX_RECONNECT_ATTEMPTS; i++) {
            try {

                MqttClient sampleClient = new MqttClient(broker, "dgproxy", persistence);

                MqttConnectOptions connOpts = new MqttConnectOptions();
                connOpts.setUserName(System.getenv("BROKER_USERNAME"));
                connOpts.setPassword(System.getenv("BROKER_PASSWORD").toCharArray());

                connOpts.setCleanSession(true);
                System.out.println("Attempt " + (i+1) + " of " + MAX_RECONNECT_ATTEMPTS + ": Connecting to broker: " + broker);
                sampleClient.connect(connOpts);
                System.out.println("Connected");

                sampleClient.setCallback(this);
                sampleClient.subscribe("Red-Hat/+/iot-demo/+/+/alerts");

                System.out.println("Subscribed");
                break;
            } catch (Exception me) {
                System.out.println("Could not connect to " + broker);
                System.out.println("msg " + me.getMessage());
                System.out.println("loc " + me.getLocalizedMessage());
                System.out.println("cause " + me.getCause());
                System.out.println("excep " + me);
                me.printStackTrace();
            }
            try {
                System.out.println("Waiting for 10s to retry");
                Thread.sleep(10000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void connectionLost(Throwable throwable) {
        System.out.println("CONNECTION LOST");
        throwable.printStackTrace();
        System.out.println("Attempting to reconnect");
        subscribeToAlerts();
    }

    private boolean isNull(String s) {
        return ((s == null) || (s.trim().isEmpty()) || s.trim().equalsIgnoreCase("null"));
    }

    private Long getLongObj(JSONObject dic, String key) {
        if (!dic.has(key) || dic.isNull(key)) {
            return null;
        } else {
            return dic.getLong(key);
        }
    }

    private String getStringObj(JSONObject dic, String key) {
        if (!dic.has(key) || dic.isNull(key)) {
            return null;
        } else {
            return dic.getString(key).trim();
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {

        String payload = mqttMessage.toString();

        System.out.println("ALERT ARRIVED FOR TOPIC " + topic + " payload: " + payload);

        JSONObject j = new JSONObject(payload);

        Long dateObj = getLongObj(j, "date");
        if (dateObj == null) {
            dateObj = new Date().getTime();
        }

        Date date = new Date(dateObj);

        String from = getStringObj(j, "from");
        String desc = getStringObj(j, "desc");
        String message = getStringObj(j, "message");
        String type = getStringObj(j, "type");
        String truck_id = getStringObj(j, "truckid");
        String sensor_id = getStringObj(j, "sensorid");

        if ("VEHICLE".equalsIgnoreCase(type)) {

            Vehicle v = dgService.getVehicles().get(truck_id.trim());
            if (v == null) {
                System.out.println("Cannot find vehicle " + truck_id + ", ignoring alert");
                return;
            }
            v.setStatus("warning");
            dgService.getVehicles().put(v.getVin(), v);
            addAlert(new Alert(date, from, desc, message, type, truck_id, null));
        } else if ("PACKAGE".equalsIgnoreCase(type)) {

            Map<String, Shipment> shipCache = dgService.getShipments();

            Shipment s = shipCache.get(sensor_id + "/" + truck_id);

            if (s == null) {
                System.out.println("Cannot find shipment for sensor_id=" + sensor_id + " truck_id=" + truck_id + ", ignoring alert");
                return;
            }

            s.setStatus("warning");
            dgService.getShipments().put(sensor_id + "/" + truck_id, s);
            addAlert(new Alert(date, from, desc, message, type, truck_id, sensor_id));
        } else {
            System.out.println("Unknown alert type (" + type + "), ignoring");
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
        System.out.println("DELIVERY COMPLETE?");

    }
}
