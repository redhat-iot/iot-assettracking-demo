package com.redhat.iot.cargodemo.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

@XmlRootElement(name="operator")
public class Operator implements Serializable {
    private String name;
    private String login;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public Operator(String name, String login) {
        this.name = name;
        this.login = login;
    }
}
