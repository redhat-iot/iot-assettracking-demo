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

: ${OPENSHIFT_PROJECT_NAME:=redhat-iot}
: ${DOCKER_ACCOUNT:=redhatiot}


# Set up new simulator instance
$OC delete dc/simulator
$OC delete configmap data-simulator-config
$OC create configmap data-simulator-config --from-file=ksim.simulator.configuration=simulator/generators.json -n "$OPENSHIFT_PROJECT_NAME"
$OC new-app -n "$OPENSHIFT_PROJECT_NAME" -f iot-simulator.yml
