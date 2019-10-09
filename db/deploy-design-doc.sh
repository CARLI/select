#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: $0 <design doc>"
  echo
  echo "   e.g. $0 ./db/designDocs/ListConflicts-DesignDoc.js"
  exit 0
fi

design_doc="$1"
couchapp="./db/node_modules/.bin/couchapp"

if [ -d "/carli" ]; then
  cd /carli
fi

if [ ! -e "$couchapp" ]; then
  echo "Cannot find couchapp"
  echo
  echo "This script should be run from either:"
  echo "  - the workdir of the CARLI middleware runtime container built for the appropriate environment"
  echo "  - the root of a Git checkout with the appropriate environment defined manually"
  exit 1
fi

require_env() {
  if [ -z "$1" ]; then
    echo "Missing required environment: \$$1"
    exit 1
  fi
}

require_env COUCH_DB_URL_SCHEME
require_env COUCH_DB_USER
require_env COUCH_DB_PASSWORD
require_env COUCH_DB_HOST

couchdb_url=${COUCH_DB_URL_SCHEME}${COUCH_DB_USER}:${COUCH_DB_PASSWORD}@${COUCH_DB_HOST}

deploy_to() {
  push ./db/designDocs/ListConflicts-DesignDoc.js $couchdb_url/$1
}

for db in `./bin/list-databases`; do
    deploy_to "$db"
done

