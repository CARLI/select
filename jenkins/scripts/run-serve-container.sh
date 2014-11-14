#!/bin/sh

host_port=$1

sudo docker rm -f carli-serve-$host_port 2> /dev/null
sudo docker run \
    --name="carli-serve-$host_port" \
    --detach=true \
    --workdir=/carli-select/browserClient \
    -p $host_port:8000 \
    carli-grunt grunt serve:jenkins
