#!/bin/bash

PUBLISH_PATH=/dev/null

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

. ./jenkins/jobs/functions.sh

linkSecureConfiguration || fail "Failed to link secure configuration"

./install-dependencies.sh || fail "Failed to install dependencies"
grunt jsenv:node || fail "Failed to set up javascript environment for node (1)"

runTests || fail "Tests Failed"
