#!/bin/sh

job=$1

echo "$job-$BUILD_NUMBER" > version.txt
