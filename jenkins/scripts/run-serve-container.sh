#!/bin/sh

host_port=$1

docker rm -f carli-serve-$host_port 2> /dev/null
docker run \
    --name="carli-serve-$host_port" \
    --detach=true \
    --workdir=/carli-select \
    -p $host_port:8000 \
    carli-grunt grunt serve
