#!/bin/sh

instance=$1
tag=$2

sudo docker rm -f carli-build-$instance 2> /dev/null
sudo docker run \
    --name "carli-build-$instance" \
    carli-build:$tag \
    /bin/echo CARLI build products container

echo "Installing build dependencies"
sudo docker run --rm -it \
    --volumes-from=carli-build-dev \
    --workdir=/carli-select \
    carli-build ./install-dependencies.sh

echo "Configuring Javascript environment for node"
sudo docker run --rm -it \
    --volumes-from=carli-build-dev \
    --workdir=/carli-select \
    carli-build grunt jsenv:node

echo "Building browser clients"
sudo docker run --rm -it \
    --volumes-from=carli-build-dev \
    --workdir=/carli-select/browserClient \
    carli-build grunt build
