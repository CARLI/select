#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

# Copy Dockerfile to root, because Docker doesn't allow ../../
cp docker/run-tests/Dockerfile .

docker build -t carli-grunt .

rm Dockerfile
