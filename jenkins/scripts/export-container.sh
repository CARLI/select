#!/bin/sh

container=$1

# Make sure artifacts directory exists, and clean up any prior artifacts.
mkdir -p ./artifacts
rm -f ./artifacts/carli-$container.tar*

# Export the image and compress it
docker save carli-$container > ./artifacts/carli-$container.tar
gzip ./artifacts/carli-$container.tar
rm -f ./artifacts/carli-$container.tar

