#!/bin/sh

instance=$1

echo "Configuring CARLI for test instance"

cd /carli-select && ./install-dependencies.sh && grunt jsenv:node
cd /carli-select/jenkins && grunt generate-config:$instance

cd /carli-select/middleware && node ./index.js
