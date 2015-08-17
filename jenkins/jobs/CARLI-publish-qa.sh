#!/bin/bash

fail () {
    echo Build Failed
    echo $*
    caller
    exit 1
}

in-directory () {
    directory=$1
    command=$2

    cd $directory
      $command
      status=$?
    cd - > /dev/null

    return $status
}


buildBrowserClients() {
    in-directory browserClient "grunt build"
}

./install-dependencies.sh || fail "Failed to install dependencies"

grunt jsenv:node || fail "Failed to set up javascript environment for node (1)"
buildBrowserClient || fail "Failed to build browser client"

grunt jsenv:node || fail "Failed to set up javascript environment for node"

