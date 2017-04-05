#!/usr/bin/env bash

###############################################################################
# Copyright (c) 2017 Red Hat Inc
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
#
###############################################################################


: ${OPENSHIFT_PROJECT_NAME:=redhat-iot}
: ${DOCKER_ACCOUNT:=redhatiot}


# Set up new simulator instance
oc delete dc/simulator
oc new-app -n "$OPENSHIFT_PROJECT_NAME" -f iot-simulator.yml #-p "DOCKER_ACCOUNT=$DOCKER_HUB_ACCOUNT" -p "BROKER_URL=$BROKER_URL" -p "IMAGE_VERSION=0.1.2"
