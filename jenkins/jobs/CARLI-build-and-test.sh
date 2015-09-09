#!/bin/bash

PUBLISH_PATH=/dev/null

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

. ./jenkins/jobs/functions.sh

initialize

runTests || fail "Tests Failed"
