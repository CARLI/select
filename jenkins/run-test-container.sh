#!/bin/sh

docker run --name carli-build --workdir=/carli-select carli-grunt grunt test
mkdir -p artifacts/test-results
docker cp carli-build:/carli-select/artifacts/test-results/karma.xml artifacts/test-results
docker rm carli-build

