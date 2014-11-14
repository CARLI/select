#!/bin/sh

container=$1
version=$2

sudo docker tag carli-$container carli-$container:$version


