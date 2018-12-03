#!/usr/bin/env bash

if [ -z "${CARLI_DOCKER_REGISTRY}" ]; then
    echo "Fatal Error: Required environment variable missing: \$CARLI_DOCKER_REGISTRY"
    echo
    echo "This is the domain of the docker registry which runtime images will be pushed to."
    echo "Jenkins must be configured to provide the appropriate value."
    echo "Include the port if required.  Do NOT include a trailing slash."
    exit 1
fi

if [ -z "${BUILD_NUMBER}" ]; then
    echo "Fatal Error: Required environment variable missing: \$BUILD_NUMBER"
    echo
    echo "This is set by Jenkins and is used to derive the version tag set on the images."
    exit 1
fi

force_rm="--force-rm"
if [ ! -z "${CARLI_DISABLE_FORCE_RM}" ]; then
    force_rm=""
fi

bump_patch_version() {
    npm version patch | cut -c 2-
}

bump_patch_version_in_directory() {
    cd $1 && next_version=`bump_patch_version` && cd .. && echo ${next_version}
}

bump_middleware_version() {
    bump_patch_version_in_directory middleware
}

bump_browserClient_version() {
    bump_patch_version_in_directory browserClient
}

browserClientVersion=`bump_browserClient_version`
middlewareVersion=`bump_middleware_version`

buildDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
browserClientsDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/browser-clients:${browserClientVersion}"
middlewareDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/middleware:${middlewareVersion}"

build_build_image() {
    docker build ${force_rm} --target build --tag ${buildDockerImage} .
}

build_browser_clients_image() {
    docker build ${force_rm} --target browser-clients --tag ${browserClientsDockerImage} .
}

build_middleware_image() {
    docker build ${force_rm} --target middleware --tag ${middlewareDockerImage} .
}

build_both_runtime_images() {
    build_browser_clients_image && build_middleware_image
}

push_browser_clients_image() {
    docker push ${browserClientsDockerImage}
}

push_middleware_image() {
    docker push ${middlewareDockerImage}
}

push_both_runtime_images() {
    push_browser_clients_image && push_middleware_image
}

push_versions_back_to_git() {
    git add middleware/package*.json
    git commit -m "Middleware ${middlewareVersion}"
    git add browserClient/package*.json
    git commit -m "Browser Client ${browserClientVersion}"

    git push
}

build_build_image && build_both_runtime_images && push_both_runtime_images && push_versions_back_to_git

