#!/bin/sh

instance=$1
host_port=$2

sudo docker rm -f carli-couchdb-$instance 2> /dev/null
sudo docker run \
    --name="carli-couchdb-$instance" \
    --detach=true \
    carli-couchdb
