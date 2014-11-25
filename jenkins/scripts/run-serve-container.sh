#!/bin/sh

instance=$1
tag=$2
host_port=$3

sudo docker rm -f carli-serve-$instance 2> /dev/null
sudo docker run \
    --name="carli-serve-$instance" \
    --detach=true \
    --workdir=/carli-select/browserClient \
    --link=carli-couchdb-$instance:couchdb \
    -p $host_port:8000 \
    carli-grunt:$tag /carli-select/docker/grunt/serve.sh $instance
