#!/bin/sh

echo "Configuring CARLI for test instance"
cd /carli-select/CARLI && grunt generate-couch-config:test
cd /carli-select && grunt deploy-db
cd /carli-select && grunt test:jenkins
