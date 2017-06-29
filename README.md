Auto Install OpenShift and Fleet Telematics & Asset Tracking IoT Demo
==================================================
This project automates the setup of Fleet Telematics & Asset Tracking IoT Demo and OpenShift using [OpenShift install demo](https://github.com/redhatdemocentral/ocp-install-demo). It first installs OpenShift on the local system and then creates IoT demo project to this OpenShift instance. All of this is done by running just one script - thanks to Eric, Andrew....

The setup requires a docker engine, OpenShift command line tools and VirtualBox, but these checks happen when you run the
installation and point you to what is missing.

Pro Tip: Pay close attention to conosle output, will guide you to dependencies you need if missing. These dependencies are 
listed here and the install provides pointers to downloads if missing:

   ```
   1. VirtualBox
   2. Docker engine version 17.03
   3. OpenShift Client (oc) v3.5.5.5
   ```


Installation Steps
-----------------------
```
$ git clone -b Summit-Demo-Setup https://github.com/redhat-iot//auto-install-demo
$ cd auto-install-demo
$ ./init.sh

Login to web console at: 
https://192.168.99.101:8443
 
user: openshift-dev                
password: devel  

```

This is an example IoT demo showing a realtime updating dashboard of data streaming from an
IoT gateway device (based on Eclipse Kura) through an Eclipse Kapua-based instance.

It demonstrates realtime fleet telematics, package tracking, alerting, and a telemetry dashboard showing critical measurements of packages in transit,
including temperature, humidity, displacement, light levels, etc.

![Dashboard Screenshot](docs/screenshots/fleet.png "Dashboard Screenshot")
![Dashboard Screenshot](docs/screenshots/exec.png "Exec Dashboard Screenshot")


The demo deploys as an Angular.js app running on a Node.js runtime, along with JBoss Data Grid and a Data Grid
proxy component that properly handles browser-based REST requests and relays to JBoss Data Grid via the Hotrod
protocol.

Eclipse Kapua is also deployed and acts as the IoT cloud management layer.

Once everything is up and running, you can access the demo using the URL of the `dashboard` route,
for example `http://dashboard-redhat-iot.domain`

Confirm that all the components are running successfully:

```
oc get pods --show-all=false
```
You should see the following pods and their status:

|NAME                 |   READY     | STATUS  |
|---------------------|:-----------:|:-------:|
|dashboard-1-xxx      |    1/1      | Running |
|datastore-1-xxx      |    1/1      | Running |
|datastore-proxy-1-xxx|    1/1      | Running |
|elasticsearch-1-xxx  |    1/1      | Running |
|kapua-api-1-wc1l7    |    1/1      | Running |
|kapua-broker-1-xxx   |    1/1      | Running |
|kapua-console-1-xxx  |    1/1      | Running |
|simulator-1-xxx      |    1/1      | Running |
|sql-1-xxx            |    1/1      | Running |

Eclipse Kapua API Documentation
-------------------------------
Eclipse Kapua exposes a REST API which can be used to access Kapua data and invoke Kapua operations. The REST API application is running as a dedicated Java process.

For example, to use the `curl` command login to Eclipse Kapua and retrieve an authentication token:

```
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{"password": ["your_password"], "username": "your_username"}' 'http://api-redhat-iot.domain/v1/authentication/user'
```

Once logged in, the retrieved token can be passed for future API calls, e.g.

```
curl -X GET --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Authorization: Bearer <AUTH_TOKEN_HERE>' http://api-redhat-iot.domain/v1/my_scope/devices
```

The complete API documentation can accessed using the URL of the `api` route, for example `http://api-redhat-iot.domain/doc`. More information on the REST API can be found in the [Eclipse Kapua user guide](http://download.eclipse.org/kapua/docs/develop/user-manual/en/rest.html).

Uninstalling and cleaning up project
------------------------------------
```
oc delete all --all -n redhat-iot && oc delete configmap hawkular-openshift-agent-kapua data-simulator-config -n redhat-iot
```
This will delete everything but the project "Red Hat IoT". This is suitable for testing new scripts, template,
etc.

Troubleshooting
---------------

## 1. Docker daemon is not running... or is running insecurely...

*On Mac*

Start the docker engine app (docker engine icon will show up in the status bar)
 
*On RHEL*

Create the docker group.
```
$ sudo groupadd docker
```

Add the user to the docker & VM groups.
```
$ sudo usermod -aG docker $USER
```
Log out and log back into the system.


