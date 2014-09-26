#!/bin/sh

docker run --name carli-grunt-test --workdir=/carli-select/browserClient carli-grunt grunt test
mkdir -p artifacts/test-results
docker cp carli-grunt-test:/carli-select/artifacts/test-results/karma.xml artifacts/test-results
docker rm carli-grunt-test

