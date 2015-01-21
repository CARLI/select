#!/bin/sh

instance=$1
if [ -z "$instance" ]; then
    instance=dev
fi

echo "Configuring CARLI for $instance instance"
touch /carli-select/CARLI/config/local.js
cd /carli-select/CARLI && grunt generate-config:$instance
cd /carli-select && grunt jsenv:node && grunt deploy-db && grunt fixture-data
cd /carli-select/browserClient && grunt serve:headless
