#!/bin/sh

### This script is run on the production server, not in the Jenkin's build environment

cat /home/jenkins/carli-grunt-latest.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-grunt-latest.tgz

cat /home/jenkins/carli-counchdb-latest.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-couchdb-latest.tgz

/home/jenkins/scripts/run-db-container.sh prod 5984
/home/jenkins/scripts/run-serve-container.sh prod 80
