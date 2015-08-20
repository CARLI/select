#!/bin/bash

PUBLISH_PATH=/var/www/carli-select

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

. ./jenkins/jobs/functions.sh

linkSecureConfiguration || fail "Failed to link secure configuration"

./install-dependencies.sh || fail "Failed to install dependencies"
grunt jsenv:node || fail "Failed to set up javascript environment for node (1)"

buildBrowserClients || fail "Failed to build browser clients"
archiveBrowserClients || fail "Failed to create browser clients archive"

publishBrowserClients || fail "Failed to publish browser clients"
publishMiddleware || fail "Failed to publish middleware"

cd $PUBLISH_PATH
rm latest && ln -s $BUILD_NUMBER latest
cd - > /dev/null

sudo service nginx stop
sudo service carli-select stop
sudo service couchdb stop

sudo service couchdb start
sudo service carli-select start
sudo service nginx start
