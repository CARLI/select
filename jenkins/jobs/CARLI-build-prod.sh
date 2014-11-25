#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/export-image.sh grunt latest
$SCRIPTS/export-image.sh couchdb latest
