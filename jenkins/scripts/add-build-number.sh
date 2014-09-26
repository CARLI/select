#!/bin/sh

job=$1

echo "$job-$BUILD_NUMBER" > /tmp/carli-version.txt
`docker run -i -t carli-grunt cat \> /carli-select/browserClient/version.txt` < /tmp/carli-version.txt
rm -f /tmp/carli-version.txt
