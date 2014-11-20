#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/merge-develop-into-qa.sh &&
$SCRIPTS/add-build-number.sh qa &&
$SCRIPTS/build-container.sh couchdb &&
$SCRIPTS/build-container.sh grunt &&
$SCRIPTS/tag-container.sh grunt "qa-$BUILD_NUMBER" &&
$SCRIPTS/run-db-container.sh qa 9081 &&
$SCRIPTS/run-serve-container.sh qa 9080
 
# It isn't necessary to export the image right now, because we 
# are serving both carli.dev and carli.qa directly from the same
# machine that does the builds.

# $SCRIPTS/export-container.sh grunt
