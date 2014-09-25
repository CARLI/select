#!/bin/sh

host_port=$1

docker run \
    --rm \
    --detach=true \
    --workdir=/carli-select \
    -p $host_port:8000
    carli-grunt grunt serve
