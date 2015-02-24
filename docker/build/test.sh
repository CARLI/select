#!/bin/sh

cd /carli-select &&
    CARLI_TEST_ENABLE_CHROME="no" CARLI_TEST_ENABLE_FIREFOX="yes" CARLI_TEST_ENABLE_SHARDING="no" grunt test:jenkins
