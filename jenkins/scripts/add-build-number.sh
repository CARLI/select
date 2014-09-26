#!/bin/sh

job=$1

mkdir -p browserClien/build
echo $job-$BUILD_NUMBER > browserClient/build/version.txt
