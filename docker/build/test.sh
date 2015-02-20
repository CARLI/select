#!/bin/sh

echo "Configuring CARLI for test instance"

cd /carli-select && ./install-dependencies.sh && grunt jsenv:node
cd /carli-select/jenkins && grunt generate-config:test

cd /carli-select &&
    CARLI_TEST_ENABLE_CHROME="no" CARLI_TEST_ENABLE_FIREFOX="yes" CARLI_TEST_ENABLE_SHARDING="no" grunt test:jenkins
