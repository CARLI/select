#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

$SCRIPTS/run-data-container.sh qa last-good &&
$SCRIPTS/run-db-container.sh qa last-good 9081 &&
$SCRIPTS/run-middleware-container.sh qa last-good &&
$SCRIPTS/run-serve-container.sh qa last-good 9080
