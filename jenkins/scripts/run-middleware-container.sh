#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-middleware-$instance 2> /dev/null
sudo docker run \
    --name="carli-middleware-$instance" \
    --detach=true \
    --link=carli-couchdb-$instance:couchdb \
    -p 3000 \
    --workdir=/carli-select/middleware \
    carli-grunt:$tag node index.js
