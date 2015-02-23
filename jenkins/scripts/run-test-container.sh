#!/bin/sh

sudo docker rm -f carli-couchdb-test 2> /dev/null
sudo docker run \
    --name="carli-couchdb-test" \
    --detach=true \
    -p 5984 \
    carli-couchdb:latest

sudo docker run \
    --name="carli-middleware-test" \
    --detach=true \
    --link=carli-couchdb-test:carli-couchdb \
    --volumes-from "carli-build-dev" \
    -e "CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD" \
    -p 3000 \
    --workdir=/carli-select/middleware \
    carli-build:latest /carli-select/docker/build/serve-middleware.sh test

sudo docker run \
    --name carli-build-test \
    --workdir=/carli-select \
    --link=carli-couchdb-test:carli-couchdb \
    --volumes-from "carli-build-dev" \
    -e "CARLI_DEV_SERVER_URL=$CARLI_DEV_SERVER_URL" \
    -e "CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD" \
    carli-build:latest /carli-select/docker/build/test.sh
rc=$?

mkdir -p artifacts/test-results
sudo docker cp carli-build-test:/carli-select/artifacts/test-results artifacts

sudo docker rm carli-build-test
sudo docker rm -f carli-middleware-test 2> /dev/null

exit $rc
