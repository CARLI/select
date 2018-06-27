#!/bin/sh

# Change to root directory of the project
if [ -d .git ]; then
    cd `git rev-parse --show-toplevel`
fi

bower_options="--allow-root --config.interactive=false"

npm install
cd ./browserClient && npm install && cd - &&
cd ./CARLI && npm install && cd - &&
cd ./config && npm install && cd - &&
cd ./db && npm install && cd - &&
cd ./middleware && npm install && cd -
