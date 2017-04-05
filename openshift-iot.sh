#!/usr/bin/env bash

. openshift-common.sh

# Expose the MQTT broker on 1883 and 61614
$OC expose dc kapua-broker --type=LoadBalancer --name=mqtt-ingress

# Export the nodePorts assigned to those services, enter these into Kura, MQTT clients, etc.
# This is temporary until we work out a better way
$OC export svc mqtt-ingress

