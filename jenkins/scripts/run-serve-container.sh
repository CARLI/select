#!/bin/sh

instance=$1
tag=$2
host_port=$3

sudo docker rm -f carli-serve-$instance 2> /dev/null
sudo docker run \
    --name="carli-serve-$instance" \
    --detach=true \
    --log-driver=syslog \
    --link=carli-couchdb-$instance:carli-couchdb \
    --link=carli-middleware-$instance:carli-middleware \
    --volumes-from "carli-build-$instance" \
    -p $host_port:80 \
    carli-nginx:$tag
