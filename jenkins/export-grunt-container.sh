#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

mkdir -p ./artifacts
docker save carli-grunt > ./artifacts/carli-grunt.tar
gzip ./artifacts/carli-grunt.tar

