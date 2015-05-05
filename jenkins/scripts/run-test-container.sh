#!/bin/sh

sudo docker rm -f carli-build-test 2> /dev/null
sudo docker rm -f carli-middleware-test 2> /dev/null
sudo docker rm -f carli-couchdb-test 2> /dev/null
sudo docker rm -f carli-run-tests 2> /dev/null

echo "Creating test build products container"
sudo docker run \
    --name "carli-build-test" \
    carli-build:latest \
    /bin/echo CARLI build products container

echo "Installing build dependencies for tests"
sudo docker run --rm -t \
    --volumes-from=carli-build-test \
    --workdir=/carli-select \
    carli-build:latest ./install-dependencies.sh

echo "Configuring Javascript environment for node"
sudo docker run --rm -t \
    --volumes-from=carli-build-test \
    --workdir=/carli-select/config \
    carli-build:latest grunt jsenv:node

echo "Make sure local configuration is present"
sudo docker run --rm -t \
    --volumes-from=carli-build-test \
    --workdir=/carli-select/config \
    carli-build:latest grunt ensure-local-config

echo "Launching test CouchDb instance"
sudo docker run \
    --name="carli-couchdb-test" \
    --detach=true \
    -p 5984 \
    carli-couchdb:latest

echo "Generating config for test"
sudo docker run --rm -t \
    --volumes-from=carli-build-test \
    --link=carli-couchdb-test:carli-couchdb \
    -e "CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD" \
    --workdir=/carli-select/jenkins \
    carli-build:latest grunt generate-config:test

echo "Launching test Middleware instance"
sudo docker run \
    --name="carli-middleware-test" \
    --detach=true \
    --link=carli-couchdb-test:carli-couchdb \
    --volumes-from "carli-build-test" \
    -p 3000 \
    --workdir=/carli-select/middleware \
    carli-build:latest /carli-select/docker/build/serve-middleware.sh

echo "Building browser clients"
sudo docker run --rm -t \
    --volumes-from=carli-build-test \
    --workdir=/carli-select/browserClient \
    carli-build:latest grunt build

sudo docker run \
    --name carli-run-tests \
    --workdir=/carli-select \
    --link=carli-couchdb-test:carli-couchdb \
    --link=carli-middleware-test:carli-middleware \
    --volumes-from "carli-build-test" \
    -e "CARLI_DEV_SERVER_URL=$CARLI_DEV_SERVER_URL" \
    -e "CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD" \
    carli-build:latest /carli-select/docker/build/test.sh
rc=$?

mkdir -p artifacts/test-results
sudo docker cp carli-build-test:/carli-select/artifacts/test-results artifacts

sudo docker rm -f carli-build-test 2> /dev/null
sudo docker rm -f carli-middleware-test 2> /dev/null
sudo docker rm -f carli-couchdb-test 2> /dev/null
sudo docker rm -f carli-run-tests 2> /dev/null

exit $rc
