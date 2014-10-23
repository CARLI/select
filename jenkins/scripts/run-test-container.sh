#!/bin/sh

docker run --detach=true --name=carli-selenium --privileged -p 4444 -p 5900 elgalu/docker-selenium

docker run \
    --name carli-grunt-test \
    --workdir=/carli-select \
    --link=carli-selenium:selenium \
    -e "CARLI_DEV_SERVER_URL=$CARLI_DEV_SERVER_URL" \
    carli-grunt grunt test:jenkins
rc=$?

mkdir -p artifacts/test-results
docker cp carli-grunt-test:/carli-select/artifacts/test-results/karma.xml artifacts/test-results

docker rm carli-grunt-test
docker stop carli-selenium
docker rm carli-selenium

exit $rc
