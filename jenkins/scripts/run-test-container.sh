#!/bin/sh

my_ip=`ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}'`
export CARLI_DEV_SERVER_URL="http://$my_ip:8000"

docker run --detach=true --name=carli-selenium --privileged -p 4444 -p 5900 elgalu/docker-selenium

docker run \
    --name carli-grunt-test \
    --workdir=/carli-select/browserClient \
    --link=carli-selenium:selenium \
    carli-grunt grunt test:jenkins
rc=$?

mkdir -p artifacts/test-results
docker cp carli-grunt-test:/carli-select/artifacts/test-results/karma.xml artifacts/test-results

docker rm carli-grunt-test
docker stop carli-selenium
docker rm carli-selenium

exit $rc
