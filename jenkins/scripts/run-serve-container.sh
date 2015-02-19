#!/bin/sh

instance=$1
tag=$2
host_port=$3

sudo docker rm -f carli-serve-$instance 2> /dev/null
sudo docker run \
    --name="carli-serve-$instance" \
    --detach=true \
    --link=carli-couchdb-$instance:couchdb \
    --link=carli-middleware-$instance:middleware \
    -p $host_port:80 \
    carli-nginx:$tag
