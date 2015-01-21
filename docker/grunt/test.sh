#!/bin/sh

echo "Configuring CARLI for test instance"

touch /carli-select/CARLI/config/local.js
cd /carli-select/CARLI && grunt jsenv:node && grunt generate-config:test
cd /carli-select && grunt deploy-db
cd /carli-select &&
    CARLI_TEST_ENABLE_CHROME="no" CARLI_TEST_ENABLE_FIREFOX="yes" CARLI_TEST_ENABLE_SHARDING="no" grunt test:jenkins
