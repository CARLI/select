#!/bin/bash

### This script is run on the production server, not in the Jenkin's build environment

BUILD_NUMBER=$1
WORKSPACE=/home/jenkins/carli-select
PUBLISH_PATH=/var/www/carli-select

. /home/jenkins/.carli-select.environment
. $WORKSPACE/jenkins/jobs/functions.sh

[ -n "$BUILD_NUMBER" ] || fail "Missing required argument (build number)"

cd $WORKSPACE

fetchAndResetToMaster || fail "Failed to sync production with master branch"
linkSecureConfiguration || fail "Failed to link secure configuration"
linkLocalConfiguration || fail "Failed to link local configuration"

publishBrowserClients || fail "Failed to publish browser clients"
publishMiddleware || fail "Failed to publish middleware"

setLatestLink || fail "Failed to set the latest link"
restartServices || fail "Failed to restart services"
