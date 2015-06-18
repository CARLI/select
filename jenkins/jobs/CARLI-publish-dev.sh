#!/bin/bash

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

export CARLI_CRM_MYSQL_PASSWORD
export CARLI_INSTANCE=dev
export CARLI_DOCKER_TAG=latest
export CARLI_COUCHDB_HOST_PORT=9091
export CARLI_NGINX_HOST_PORT=9090

echo "PW1: $CARLI_CRM_MYSQL_PASSWORD"
. ./jenkins/scripts/functions.sh

redeploy-carli
