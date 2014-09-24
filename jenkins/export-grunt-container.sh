#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

# Make sure artifacts directory exists, and clean up any prior artifacts.
mkdir -p ./artifacts
rm -f ./artifacts/carli-grunt.tar.gz

# Export the image and compress it
docker save carli-grunt > ./artifacts/carli-grunt.tar
gzip ./artifacts/carli-grunt.tar

