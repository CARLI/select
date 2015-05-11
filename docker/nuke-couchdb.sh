#!/bin/sh

usage () {
    echo "Usage: $0 (dev|qa|prod)"
}

if [ -z "$1" ]; then
    usage
    exit
fi

instance=$1

echo This will destroy all data on the CARLI $instance instance.
read -p "Are you sure? [yN]" -n 1 confirm

if [ "$confirm" = "y" -o "$confirm" = "Y" ]; then
    docker run --rm \
    	--volumes-from carli-data-$instance \
    	-v $(pwd):/backup \
    	carli-couchdb \
    	rm -rf /usr/local/var/lib/couchdb/* /usr/local/var/lib/couchdb/.*
fi
