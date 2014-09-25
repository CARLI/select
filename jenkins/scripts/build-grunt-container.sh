#!/bin/sh

# Copy Dockerfile to root, because Docker doesn't allow ../../
cp docker/grunt/Dockerfile .

docker build -t carli-grunt .

rm Dockerfile
