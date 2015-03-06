#!/bin/sh

### This script is run on the production server, not in the Jenkin's build environment
. /home/jenkins/.carli-select.environment
export CARLI_CRM_MYSQL_PASSWORD

cat /home/jenkins/carli-build.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-build.tgz

cat /home/jenkins/carli-couchdb.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-couchdb.tgz

cat /home/jenkins/carli-nginx.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-nginx.tgz

/home/jenkins/scripts/run-data-container.sh prod last-good
/home/jenkins/scripts/run-db-container.sh prod last-good 5984
/home/jenkins/scripts/run-content-container.sh prod last-good
/home/jenkins/scripts/run-middleware-container.sh prod last-good
/home/jenkins/scripts/run-serve-container.sh prod last-good 80
