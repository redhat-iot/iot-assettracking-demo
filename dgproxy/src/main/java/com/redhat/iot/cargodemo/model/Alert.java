package com.redhat.iot.cargodemo.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Date;

@XmlRootElement(name="alert")
public class Alert {
    private Date date;
    private String from;
    private String desc;
    private String message;
    private String type;
    private String truckid;
    private String sensorid;

    public Alert(Date date, String from, String desc, String message, String type, String truckid, String sensorid) {
        this.date = date;
        this.from = from;
        this.desc = desc;
        this.message = message;
        this.type = type;
        this.truckid = truckid;
        this.sensorid = sensorid;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTruckid() {
        return truckid;
    }

    public void setTruckid(String truckid) {
        this.truckid = truckid;
    }

    public String getSensorid() {
        return sensorid;
    }

    public void setSensorid(String sensorid) {
        this.sensorid = sensorid;
    }
}
