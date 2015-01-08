#!/bin/sh

container=$1
version=$2

sudo docker tag -f carli-$container carli-$container:$version


