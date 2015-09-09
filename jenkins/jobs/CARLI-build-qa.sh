#!/bin/bash

PUBLISH_PATH=/var/www/carli-select

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

. ./jenkins/jobs/functions.sh

initialize

buildBrowserClients || fail "Failed to build browser clients"
archiveBrowserClients || fail "Failed to create browser clients archive"
archiveMiddleware || fail "Failed to create middleware archive"

publishBrowserClients || fail "Failed to publish browser clients"
publishMiddleware || fail "Failed to publish middleware"

setLatestLink || fail "Failed to set the latest link"
restartServices || fail "Failed to restart services"
