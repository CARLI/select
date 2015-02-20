#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-middleware-$instance 2> /dev/null
sudo docker run \
    --name="carli-middleware-$instance" \
    --detach=true \
    --link=carli-couchdb-$instance:couchdb \
    --volumes-from "carli-build-$instance" \
    -p 3000 \
    --workdir=/carli-select/middleware \
    carli-build:$tag /carli-select/docker/build/serve-middleware.sh
