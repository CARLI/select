
fail () {
    echo Build Failed
    echo $*
    caller
    exit 1
}

[ -n "$PUBLISH_PATH" ] || fail "Missing required environment variable \$PUBLISH_PATH"
[ -n "$BUILD_NUMBER" ] || fail "Missing required environment variable \$BUILD_NUMBER"
[ -n "$WORKSPACE" ] || fail "Missing required environment variable \$WORKSPACE"

linkSecureConfiguration() {
    cd config
    [ -e /home/jenkins/.carli-secure.json ] || fail "Server is missing the secure configuration file for CARLI"
    rm -f secure.json
    ln -s /home/jenkins/.carli-secure.json secure.json
    cd - > /dev/null
}

initialize() {
    linkSecureConfiguration || fail "Failed to link secure configuration"

    mkdir -p ./artifacts
    ./install-dependencies.sh || fail "Failed to install dependencies"
    grunt jsenv:node || fail "Failed to set up javascript environment for node"
    grunt ensure-local-config || fail "Failed to ensure that local config exists"
}

runTests() {
    cd $WORKSPACE
    grunt test
    status=$?
    cd - > /dev/null

    return $status
}

buildBrowserClients() {
    cd browserClient
    grunt build
    status=$?
    cd - > /dev/null

    return $status
}

buildCompiledBrowserClients() {
    cd browserClient
    grunt compile
    status=$?
    cd - > /dev/null

    return $status
}

archiveBrowserClients() {
    cd browserClient/build
    rm -f $WORKSPACE/artifacts/browserClients.tgz
    tar zcf $WORKSPACE/artifacts/browserClients.tgz .
    status=$?
    cd - > /dev/null

    return $status
}

archiveCompiledBrowserClients() {
    cd browserClient/compile
    rm -f $WORKSPACE/artifacts/browserClients.tgz
    tar zcf $WORKSPACE/artifacts/browserClients.tgz .
    status=$?
    cd - > /dev/null

    return $status
}

publishBrowserClients() {
    mkdir -p $PUBLISH_PATH/$BUILD_NUMBER/browserClients
    cd $PUBLISH_PATH/$BUILD_NUMBER/browserClients
    tar zxf $WORKSPACE/artifacts/browserClients.tgz
    status=$?
    cd - > /dev/null

    return $status
}

archiveMiddleware() {
    rm -f $WORKSPACE/artifacts/middleware.tgz
    tar zcf $WORKSPACE/artifacts/middleware.tgz CARLI config db middleware schemas
}

publishMiddleware() {
    mkdir -p $PUBLISH_PATH/$BUILD_NUMBER/middleware
    cd $PUBLISH_PATH/$BUILD_NUMBER/middleware
    tar zxf $WORKSPACE/artifacts/middleware.tgz
    status=$?
    cd - > /dev/null

    return $status
}

fetchAndResetToMaster () {
    git fetch && git reset --hard origin/master
}

updateMasterIfRequested () {
    commitish="$1"

    if [ "$commitish" != "master" ]; then
        echo "Resetting master branch to $commitish"
        git branch -f master $commitish
        git checkout master
        git push -f origin master
    fi
}

setLatestLink() {
    cd $PUBLISH_PATH
    rm latest && ln -s $BUILD_NUMBER latest
    cd - > /dev/null
}

restartServices() {
    sudo service nginx stop
    sudo service carli-select stop
    sudo service couchdb stop

    sudo service couchdb start
    sudo service carli-select start
    sudo service nginx start
}
