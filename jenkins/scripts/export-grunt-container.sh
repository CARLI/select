#!/bin/sh

# Make sure artifacts directory exists, and clean up any prior artifacts.
mkdir -p ./artifacts
rm -f ./artifacts/carli-grunt.tar*

# Export the image and compress it
docker save carli-grunt > ./artifacts/carli-grunt.tar
gzip ./artifacts/carli-grunt.tar

