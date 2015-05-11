#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 (dev|qa|prod)"
    exit
fi

instance=$1

docker start carli-couchdb-$instance && docker start carli-middleware-$instance && docker start carli-serve-$instance
