package com.redhat.iot.cargodemo.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@XmlRootElement(name="shipment")
public class Shipment implements Serializable {

    private List<Telemetry> telemetry;
    private Customer customer;
    private String desc;
    private String name;
    private String sensor_id;
    private List<Facility> route;
    private Date etd;
    private Date eta;
    private double amount_paid;
    // realtime data
    private Vehicle cur_vehicle;
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Telemetry> getTelemetry() {
        return telemetry;
    }

    public void setTelemetry(List<Telemetry> telemetry) {
        this.telemetry = telemetry;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getSensor_id() {
        return sensor_id;
    }

    public void setSensor_id(String sensor_id) {
        this.sensor_id = sensor_id;
    }

    public List<Facility> getRoute() {
        return route;
    }

    public void setRoute(List<Facility> route) {
        this.route = route;
    }

    public Date getEtd() {
        return etd;
    }

    public void setEtd(Date etd) {
        this.etd = etd;
    }

    public Date getEta() {
        return eta;
    }

    public void setEta(Date eta) {
        this.eta = eta;
    }

    public double getAmount_paid() {
        return amount_paid;
    }

    public void setAmount_paid(double amount_paid) {
        this.amount_paid = amount_paid;
    }

    public Vehicle getCur_vehicle() {
        return cur_vehicle;
    }

    public void setCur_vehicle(Vehicle cur_vehicle) {
        this.cur_vehicle = cur_vehicle;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Shipment() {
        this.status = "ok";
    }
    public Shipment(Customer customer, String name, String desc, String sensor_id, List<Facility> route, Date etd, Date eta, double amount_paid, Vehicle cur_vehicle) {
        super();
        this.status = "ok";
        this.customer = customer;
        this.name = name;
        this.desc = desc;
        this.sensor_id = sensor_id;
        this.route = route;
        this.etd = etd;
        this.eta = eta;
        this.amount_paid = amount_paid;
        this.cur_vehicle = cur_vehicle;
    }
}
