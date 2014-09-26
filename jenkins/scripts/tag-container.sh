#!/bin/sh

container=$1
version=$2

docker tag carli-$container carli-$container:$version


