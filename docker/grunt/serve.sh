#!/bin/sh

instance=$1
if [ -z "$instance" ]; then
    instance=dev
fi

cd /carli-select/CARLI && grunt container-config-$instance
cd /carli-select && grunt deploy-db
cd /carli-select/browserClient && grunt serve
