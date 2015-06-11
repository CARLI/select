#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

export CARLI_INSTANCE=qa
export CARLI_DOCKER_TAG=last-good
export CARLI_COUCHDB_HOST_PORT=9081
export CARLI_NGINX_HOST_PORT=9080

. ./jenkins/scripts/functions.sh

redeploy-carli
