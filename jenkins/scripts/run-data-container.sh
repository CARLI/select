#!/bin/sh

instance=$1
tag=$2

sudo docker inspect carli-data-$instance 2>&1 > /dev/null
data_container_status=$?

# Do not recreate the data container if it already exists.
# The point of this container is persist the data storage.
if [ $data_container_status -eq 1 ]; then
    sudo docker run \
        --name "carli-data-$instance" \
        carli-couchdb:$tag \
        /bin/echo Couch Data-only Container
fi
