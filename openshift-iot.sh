#!/usr/bin/env bash

# Expose the MQTT broker on 1883 and 61614
oc expose dc kapua-broker --type=LoadBalancer --name=mqtt-ingress

# Export the nodePorts assigned to those services, enter these into Kura, MQTT clients, etc.
# This is temporary until we work out a better way
oc export svc mqtt-ingress

