#!/bin/sh

# Change to root directory of the project
cd `git rev-parse --show-toplevel`

npm install
cd ./browserClient && npm install && bower install && cd -
cd ./CARLI && npm install && cd -
cd ./config && npm install && cd -
cd ./db && npm install && cd -
cd ./middleware && npm install && cd -
cd ./migration && npm install && cd -
