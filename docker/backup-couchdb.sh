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

docker run --rm \
	--volumes-from carli-data-$instance \
	-v $(pwd):/backup \
	carli-couchdb \
	tar zcvf /backup/$filename /usr/local/var/lib/couchdb
