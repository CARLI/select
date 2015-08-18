#!/bin/bash

PUBLISH_PATH=/var/www/carli-select

fail () {
    echo Build Failed
    echo $*
    caller
    exit 1
}

buildBrowserClients() {
    cd browserClient
    grunt build
    status=$?
    cd - > /dev/null

    return $status
}

archiveBrowserClients() {
    cd browserClient/build
    tar zcf ../../artifacts/browserClients.tgz .
    status=$?
    cd - > /dev/null

    return $status
}

publishBrowserClients() {
    mkdir -p $PUBLISH_PATH/$BUILD_NUMBER/browserClients
    cd $PUBLISH_PATH/$BUILD_NUMBER/browserClients
    tar zxf $WORKSPACE/artifacts/browserClients.tgz
    status=$?
    cd - > /dev/null

    return $status
}

archiveMiddleware() {
    tar zcf ./artifacts/middleware.tgz CARLI config middleware schemas
}

publishMiddleware() {
    mkdir -p $PUBLISH_PATH/$BUILD_NUMBER/middleware
    cd $PUBLISH_PATH/$BUILD_NUMBER/middleware
    tar zxf $WORKSPACE/artifacts/middleware.tgz
    status=$?
    cd - > /dev/null

    return $status
}


./install-dependencies.sh || fail "Failed to install dependencies"

grunt jsenv:node || fail "Failed to set up javascript environment for node (1)"
buildBrowserClients || fail "Failed to build browser clients"
archiveBrowserClients || fail "Failed to create browser clients archive"

publishBrowserClients || fail "Failed to publish browser clients"
publishMiddleware || fail "Failed to publish middleware"

cd /var/www/carli-select
rm latest && ln -s $BUILD_NUMBER latest
cd - > /dev/null

sudo service nginx stop
sudo service carli-select stop
sudo service couchdb stop

sudo service couchdb start
sudo service carli-select start
sudo service nginx start

