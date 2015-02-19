#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/add-build-number.sh dev &&

$SCRIPTS/build-container.sh couchdb &&
$SCRIPTS/build-container.sh grunt &&
$SCRIPTS/build-container.sh middleware &&
$SCRIPTS/build-container.sh nginx &&

$SCRIPTS/tag-container.sh couchdb latest &&
$SCRIPTS/tag-container.sh grunt latest &&
$SCRIPTS/tag-container.sh middleware latest &&
$SCRIPTS/tag-container.sh nginx latest &&

$SCRIPTS/run-data-container.sh dev latest &&
$SCRIPTS/run-db-container.sh dev latest 9091 &&
$SCRIPTS/run-middleware-container.sh dev latest &&
$SCRIPTS/run-test-container.sh dev latest &&

$SCRIPTS/tag-container.sh couchdb last-good &&
$SCRIPTS/tag-container.sh grunt last-good &&
$SCRIPTS/tag-container.sh middleware last-good &&
$SCRIPTS/tag-container.sh nginx last-good

rc=$?

$SCRIPTS/run-serve-container.sh dev latest 9090

exit $rc
