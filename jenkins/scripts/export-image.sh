#!/bin/sh

image=$1
tag=$2

# Make sure artifacts directory exists, and clean up any prior artifacts.
mkdir -p ./artifacts
rm -f ./artifacts/carli-$image*

# Export the image and compress it
docker save carli-$image:$tag | gzip > ./artifacts/carli-$image-$tag.tgz

