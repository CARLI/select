#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/build-grunt-container.sh
$SCRIPTS/run-test-container.sh

# It isn't necessary to export the image right now, because we 
# are serving both carli.dev and carli.qa directly from the same
# machine that does the builds.

# $SCRIPTS/export-grunt-container.sh
