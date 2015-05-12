#!/bin/sh

cd /carli-select/CARLI && grunt test:jenkins

mocha_status=$?

cd /carli-select/browserClient && grunt test:jenkins

exit $mocha_status

