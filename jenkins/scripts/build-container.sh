#!/bin/sh

container=$1

# Copy Dockerfile to root, because Docker doesn't allow ../../
cp docker/$container/Dockerfile .
docker build -t carli-$container .
rm -f Dockerfile
