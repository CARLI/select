#!/bin/sh

job=$1

mkdir -p browserClient/build
echo $job-$BUILD_NUMBER > browserClient/build/version.txt
