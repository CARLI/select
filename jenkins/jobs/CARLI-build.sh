#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

SCRIPTS=./jenkins/scripts

all_containers="couchdb build nginx"

$SCRIPTS/add-build-number.sh dev &&

build_all_containers () {
    for container in $all_containers; do
        $SCRIPTS/build-container.sh $container
    done
}

tag_all_containers () {
    tag=$1
    for container in $all_containers; do
        $SCRIPTS/tag-container.sh $container $tag
    done
}

tag_and_run_tests () {
    build_all_containers &&
    tag_all_containers latest &&
    $SCRIPTS/run-test-container.sh &&
    tag_all_containers last-good
}

tag_and_run_tests
rc=$?
exit $rc
