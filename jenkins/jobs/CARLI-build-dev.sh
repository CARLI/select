#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/add-build-number.sh dev &&

$SCRIPTS/build-container.sh couchdb &&
$SCRIPTS/build-container.sh build &&
$SCRIPTS/build-container.sh nginx &&

$SCRIPTS/tag-container.sh couchdb latest &&
$SCRIPTS/tag-container.sh build latest &&
$SCRIPTS/tag-container.sh nginx latest &&

$SCRIPTS/run-data-container.sh dev latest &&
$SCRIPTS/run-db-container.sh dev latest 9091 &&
$SCRIPTS/run-content-container.sh dev latest &&
$SCRIPTS/run-middleware-container.sh dev latest &&
$SCRIPTS/run-test-container.sh dev latest &&

$SCRIPTS/tag-container.sh couchdb last-good &&
$SCRIPTS/tag-container.sh build last-good &&
$SCRIPTS/tag-container.sh nginx last-good

rc=$?

$SCRIPTS/run-serve-container.sh dev latest 9090

exit $rc
