#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/build-container.sh grunt
$SCRIPTS/run-test-container.sh
$SCRIPTS/run-serve-container.sh 9090
 
# It isn't necessary to export the image right now, because we 
# are serving both carli.dev and carli.qa directly from the same
# machine that does the builds.

# $SCRIPTS/export-container.sh grunt
