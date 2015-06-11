#!/bin/bash

### This script is run on the production server, not in the Jenkin's build environment
. /home/jenkins/.carli-select.environment

export CARLI_CRM_MYSQL_PASSWORD
export CARLI_INSTANCE=prod
export CARLI_DOCKER_TAG=last-good
export CARLI_COUCHDB_HOST_PORT=5984
export CARLI_NGINX_HOST_PORT=80

. /home/jenkins/scripts/functions.sh

cat /home/jenkins/carli-build.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-build.tgz

cat /home/jenkins/carli-couchdb.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-couchdb.tgz

cat /home/jenkins/carli-nginx.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-nginx.tgz

redeploy-carli
