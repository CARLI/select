#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-middleware-$instance 2> /dev/null
sudo docker run \
    --name="carli-middleware-$instance" \
    --detach=true \
    -p 3000
    carli-middleware:$tag
