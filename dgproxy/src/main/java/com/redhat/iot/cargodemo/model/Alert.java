package com.redhat.iot.cargodemo.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Date;

@XmlRootElement(name="alert")
public class Alert {
    private Date date;
    private String from;
    private String desc;
    private String message;
    private String severity;
    private String truck_id;
    private String sensor_id;

    public Alert(Date date, String from, String desc, String message, String severity, String truck_id, String sensor_id) {
        this.date = date;
        this.from = from;
        this.desc = desc;
        this.message = message;
        this.severity = severity;
        this.truck_id = truck_id;
        this.sensor_id = sensor_id;
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

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getTruck_id() {
        return truck_id;
    }

    public void setTruck_id(String truck_id) {
        this.truck_id = truck_id;
    }

    public String getSensor_id() {
        return sensor_id;
    }

    public void setSensor_id(String sensor_id) {
        this.sensor_id = sensor_id;
    }
}
