#!/bin/sh

cd /carli-select/CARLI
grunt container-config

cd /carli-select
grunt test:jenkins
