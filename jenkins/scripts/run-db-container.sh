#!/bin/sh

instance=$1
tag=$2
host_port=$3

sudo docker rm -f carli-couchdb-$instance 2> /dev/null
sudo docker run \
    --name="carli-couchdb-$instance" \
    --volumes-from "carli-data-$instance" \
    --detach=true \
    --log-driver=syslog \
    -p $host_port:5984 \
    carli-couchdb:$tag
