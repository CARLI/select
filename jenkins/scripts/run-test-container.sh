#!/bin/sh

instance=$1
tag=$2

sudo docker run --detach=true --name=carli-selenium --privileged -p 4444 -p 5900 elgalu/docker-selenium

sudo docker run \
    --name carli-grunt-test \
    --workdir=/carli-select \
    --link=carli-selenium:selenium \
    --link=carli-couchdb-$instance:couchdb \
    -e "CARLI_DEV_SERVER_URL=$CARLI_DEV_SERVER_URL" \
    carli-grunt:$tag /carli-select/docker/grunt/test.sh
rc=$?

mkdir -p artifacts/test-results
sudo docker cp carli-grunt-test:/carli-select/artifacts/test-results artifacts

sudo docker rm carli-grunt-test
sudo docker stop carli-selenium
sudo docker rm carli-selenium

exit $rc
