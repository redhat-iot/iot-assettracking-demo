package com.redhat.iot.cargodemo.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@XmlRootElement(name="vehicle")
public class Vehicle implements Serializable {

    private String vin;
    private String desc;
    private List<Telemetry> telemetry;
    private Facility origin;
    private Facility destination;
    private Date eta;
    private String status;

    public Date getEta() {
        return eta;
    }

    public void setEta(Date eta) {
        this.eta = eta;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public List<Telemetry> getTelemetry() {
        return telemetry;
    }

    public void setTelemetry(List<Telemetry> telemetry) {
        this.telemetry = telemetry;
    }


    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public Vehicle() {
        this.status = "ok";

    }
    public Facility getOrigin() {
        return origin;
    }

    public void setOrigin(Facility origin) {
        this.origin = origin;
    }

    public Facility getDestination() {
        return destination;
    }

    public void setDestination(Facility destination) {
        this.destination = destination;
    }

    public Vehicle(String vin, String desc) {
        super();
        this.status = "ok";
        this.vin = vin;
        this.desc = desc;
    }
}
