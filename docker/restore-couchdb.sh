#!/bin/sh

usage () {
    echo "Usage: $0 (dev|qa|prod) <backupfile.tgz>"
}

if [ -z "$1" ]; then
    usage
    exit
fi

instance=$1

if [ -z "$2" ]; then
    usage
    exit
fi

filename=$2

echo This operation will not delete any databases that exist on $instance but not in $filename
echo This *will* overwrite the contents of existing databases on the CARLI $instance instance

read -p "Are you sure? [yN]" -n 1 confirm

if [ "$confirm" = "y" -o "$confirm" = "Y" ]; then
    docker run --rm \
	    --volumes-from carli-data-$instance \
	    -v $(pwd):/backup \
	    carli-couchdb \
	    tar zxvf /backup/$filename
fi

