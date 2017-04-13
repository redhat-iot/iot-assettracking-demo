package com.redhat.iot.cargodemo.service;

import com.redhat.iot.cargodemo.model.*;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.context.Initialized;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class AlertsService implements MqttCallback {

    final private List<Alert> alerts = Collections.synchronizedList(new ArrayList<>());

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
                if (alert.getVin().equals(v.getVin())) {
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
        try {

            MqttClient sampleClient = new MqttClient(broker, "dgproxy", persistence);

            MqttConnectOptions connOpts = new MqttConnectOptions();
            connOpts.setUserName(System.getenv("BROKER_USERNAME"));
            connOpts.setPassword(System.getenv("BROKER_PASSWORD").toCharArray());

            connOpts.setCleanSession(true);
            System.out.println("Connecting to broker: " + broker);
            sampleClient.connect(connOpts);
            System.out.println("Connected");

            sampleClient.setCallback(this);
            sampleClient.subscribe("Red-Hat/+/iot-demo/+/+/alerts");

            System.out.println("Subscribed");
        } catch (MqttException me) {
            System.out.println("reason " + me.getReasonCode());
            System.out.println("msg " + me.getMessage());
            System.out.println("loc " + me.getLocalizedMessage());
            System.out.println("cause " + me.getCause());
            System.out.println("excep " + me);
            me.printStackTrace();
        }

    }

    @Override
    public void connectionLost(Throwable throwable) {
        System.out.println("CONNECTION LOST");
        throwable.printStackTrace();
    }

    @Override
    public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
        System.out.println("ALERT ARRIVED FOR TOPIC " + topic);

        String[] parts = topic.split("/");
        if (parts.length != 6) {
            System.out.println("Message arrived on unknown topic: " + topic + " -- ignoring");
            return;
        }

        String objId = parts[parts.length - 2];
        String objType = parts[parts.length - 3];

        if ("trucks".equals(objType)) {
            Vehicle v = dgService.getVehicles().get(objId);
            if (v == null) {
                System.out.println("Cannot find vehicle " + objId + ", ignoring alert");
                return;
            }
            addAlert(new Alert("vehicle alert", v.getVin(), null));
        } else if ("packages".equals(objType)) {

            Map<String, Shipment> shipCache = dgService.getShipments();
            List<Shipment> shipments = shipCache.keySet().stream()
                    .map(shipCache::get)
                    .filter(s -> objId.equals(s.getSensor_id()))
                    .collect(Collectors.toList());


            if (shipments == null || shipments.size() <= 0) {
                System.out.println("Cannot find shipment " + objId + ", ignoring alert");
                return;
            }

            for (Shipment alertShip : shipments) {
                addAlert(new Alert("package alert", alertShip.getCur_vehicle().getVin(), alertShip.getSensor_id()));
            }
        } else {
            System.out.println("UNknown alert object type " + objType + ", ignoring alert");
        }


//        System.out.println("Payload: " + mqttMessage.toString());
//
//        KuraPayloadProto.KuraPayload payload = KuraPayloadProto.KuraPayload.parseFrom(mqttMessage.getPayload());
//        for (KuraPayloadProto.KuraPayload.KuraMetric metric : payload.getMetricList()) {
//            System.out.println("Kura metric name: " + metric.getName());
//        }

    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
        System.out.println("DELIVERY COMPLETE?");

    }
}
