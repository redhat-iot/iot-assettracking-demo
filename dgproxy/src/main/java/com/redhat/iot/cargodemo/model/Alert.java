package com.redhat.iot.cargodemo.model;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="alert")
public class Alert {
    private String msg;
    private String vin;
    private String sensor_id;

    public Alert(String msg, String vin, String sensor_id) {
        this.msg = msg;
        this.vin = vin;
        this.sensor_id = sensor_id;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public String getSensor_id() {
        return sensor_id;
    }

    public void setSensor_id(String sensor_id) {
        this.sensor_id = sensor_id;
    }
}
