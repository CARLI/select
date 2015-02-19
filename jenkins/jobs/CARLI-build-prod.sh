#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/export-image.sh nginx last-good
$SCRIPTS/export-image.sh couchdb last-good
