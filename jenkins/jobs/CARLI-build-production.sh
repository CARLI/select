#!/bin/bash

PUBLISH_PATH=/var/www/carli-select

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

. ./jenkins/jobs/functions.sh

updateMasterIfRequested $CARLI_PUBLISH_COMMITISH

initialize

buildBrowserClients || fail "Failed to build browser clients"
archiveBrowserClients || fail "Failed to create browser clients archive"
archiveMiddleware || fail "Failed to create middleware archive"
