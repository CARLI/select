#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-build-$instance 2> /dev/null
sudo docker run \
    --name "carli-build-$instance" \
    carli-build:$tag \
    /bin/echo Couch Data-only Container
