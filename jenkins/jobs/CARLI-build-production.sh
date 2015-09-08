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
archiveMiddleware || fail "Failed to create middleware archive"
