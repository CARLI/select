#!/bin/sh

if [ -z "$1" ]; then
    echo "Usage: $0 (dev|qa|prod)"
    exit
fi

instance=$1

docker stop carli-serve-$instance && docker stop carli-middleware-$instance && docker stop carli-couchdb-$instance
