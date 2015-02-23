#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-middleware-$instance 2> /dev/null
sudo docker run \
    --name="carli-middleware-$instance" \
    --detach=true \
    --link=carli-couchdb-$instance:carli-couchdb \
    --volumes-from "carli-build-$instance" \
    -e "CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD" \
    -p 3000 \
    --workdir=/carli-select/middleware \
    carli-build:$tag /carli-select/docker/build/serve-middleware.sh $instance
