#!/bin/sh

container=$1

# Copy Dockerfile to root, because Docker doesn't allow ../../
cp docker/$container/Dockerfile .
sudo docker build -t carli-$container .
rc=$?

rm -f Dockerfile

exit $rc
