#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/add-build-number.sh dev &&
$SCRIPTS/build-container.sh couchdb &&
$SCRIPTS/build-container.sh grunt &&
$SCRIPTS/tag-container.sh couchdb latest &&
$SCRIPTS/tag-container.sh grunt latest &&
$SCRIPTS/run-db-container.sh dev latest 9091 &&
$SCRIPTS/run-test-container.sh dev latest &&
$SCRIPTS/tag-container.sh couchdb last-good &&
$SCRIPTS/tag-container.sh grunt last-good

$SCRIPTS/run-serve-container.sh dev latest 9090

