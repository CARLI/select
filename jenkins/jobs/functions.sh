
fail () {
    echo Build Failed
    echo $*
    caller
    exit 1
}

[ -n "$PUBLISH_PATH" ] || fail "Missing required environment variable \$PUBLISH_PATH"
[ -n "$BUILD_NUMBER" ] || fail "Missing required environment variable \$BUILD_NUMBER"
[ -n "$WORKSPACE" ] || fail "Missing required environment variable \$WORKSPACE"

runTests() {
    cd browserClient
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

archiveBrowserClients() {
    cd browserClient/build
    tar zcf ../../artifacts/browserClients.tgz .
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
    tar zcf ./artifacts/middleware.tgz CARLI config middleware schemas
}

publishMiddleware() {
    mkdir -p $PUBLISH_PATH/$BUILD_NUMBER/middleware
    cd $PUBLISH_PATH/$BUILD_NUMBER/middleware
    tar zxf $WORKSPACE/artifacts/middleware.tgz
    status=$?
    cd - > /dev/null

    return $status
}
