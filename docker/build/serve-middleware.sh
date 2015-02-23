#!/bin/sh

instance=$1

echo "Configuring CARLI for deployment"

cd /carli-select && grunt jsenv:node
cd /carli-select/jenkins && grunt generate-config:$instance
cd /carli-select/middleware && node ./index.js
