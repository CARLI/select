#!/bin/bash

PUBLISH_PATH=/dev/null

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

. ./jenkins/functions.sh

./install-dependencies.sh || fail "Failed to install dependencies"
grunt jsenv:node || fail "Failed to set up javascript environment for node (1)"

buildBrowserClients || fail "Failed to build browser clients"
runTests || fail "Tests Failed"
