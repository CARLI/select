#!/bin/sh

### This script is run on the production server, not in the Jenkin's build environment

cat /home/jenkins/carli-grunt-latest.tgz | gunzip | docker load
rm /home/jenkins/carli-grunt-latest.tgz

/home/jenkins/scripts/run-serve-container.sh 80
