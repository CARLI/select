#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/run-data-container.sh dev latest &&
$SCRIPTS/run-db-container.sh dev latest 9091 &&
$SCRIPTS/run-content-container.sh dev latest &&
$SCRIPTS/run-middleware-container.sh dev latest &&
$SCRIPTS/run-serve-container.sh dev latest 9090
