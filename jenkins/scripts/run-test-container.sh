#!/bin/sh

instance=$1
tag=$2

sudo docker run \
    --name carli-build-test \
    --workdir=/carli-select \
    --link=carli-couchdb-$instance:carli-couchdb \
    -e "CARLI_DEV_SERVER_URL=$CARLI_DEV_SERVER_URL" \
    carli-build:$tag /carli-select/docker/build/test.sh
rc=$?

mkdir -p artifacts/test-results
sudo docker cp carli-build-test:/carli-select/artifacts/test-results artifacts

sudo docker rm carli-build-test

exit $rc
