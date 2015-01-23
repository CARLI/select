#!/bin/sh

db_name=carli
if [ ! -z "$1" ]; then
    db_name=$1
fi

couchdb_url="http://localhost:5984/$db_name"
if [ ! -z "$COUCHDB_PORT_5984_TCP_ADDR" -a ! -z "$COUCHDB_PORT_5984_TCP_PORT" ]; then
    couchdb_url="http://$COUCHDB_PORT_5984_TCP_ADDR:$COUCHDB_PORT_5984_TCP_PORT/$db_name"
fi

curl -X DELETE $couchdb_url
curl -X PUT $couchdb_url
./node_modules/.bin/couchapp push CARLI-DesignDoc.js $couchdb_url

