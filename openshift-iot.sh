#!/usr/bin/env bash
#*******************************************************************************
# Copyright (c) 2017 Red Hat, Inc and others
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
#
# Contributors:
#     Red Hat, Inc. - initial API and implementation
#
#******************************************************************************

. openshift-common.sh

# Expose the MQTT broker on 1883 and 61614
$OC expose dc kapua-broker --type=LoadBalancer --name=mqtt-ingress

# Export the nodePorts assigned to those services, enter these into Kura, MQTT clients, etc.
# This is temporary until we work out a better way
$OC export svc mqtt-ingress

