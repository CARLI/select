#!/bin/sh

### This script is run on the production server, not in the Jenkin's build environment

cat /home/jenkins/carli-grunt.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-grunt.tgz

cat /home/jenkins/carli-couchdb.tgz | gunzip | sudo docker load
rm /home/jenkins/carli-couchdb.tgz

/home/jenkins/scripts/run-db-container.sh prod last-good 5984
/home/jenkins/scripts/run-serve-container.sh prod last-good 80
