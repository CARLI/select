#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-data-$instance 2> /dev/null
sudo docker run --name "carli-data-$instance" carli-couchdb:$tag /bin/echo Couch Data-only Container

