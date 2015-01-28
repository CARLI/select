#!/bin/sh

instance=$1
if [ -z "$instance" ]; then
    instance=dev
fi

echo "Configuring CARLI for $instance instance"

cd /carli-select && grunt jsenv:node
cd /carli-select/jenkins && grunt generate-config:$instance
cd /carli-select && grunt deploy-db && grunt fixture-data

cd /carli-select && grunt serve:headless
