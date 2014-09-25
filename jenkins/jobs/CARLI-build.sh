#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/build-grunt-container.sh
$SCRIPTS/run-test-container.sh
$SCRIPTS/export-grunt-container.sh
