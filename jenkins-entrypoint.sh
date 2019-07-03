#!/usr/bin/env bash

if [ -z "${CARLI_DOCKER_REGISTRY}" ]; then
    export CARLI_DOCKER_REGISTRY="carli-select-integration.pixodev.net:5000"
fi

if [ -z "${BUILD_NUMBER}" ]; then
    export BUILD_NUMBER="date +%Y%m%d%s"
fi

force_rm="--force-rm"
if [ ! -z "${CARLI_DISABLE_FORCE_RM}" ]; then
    force_rm=""
fi

bump_patch_version() {
    npm version patch | cut -c 2-
}

bump_patch_version_in_directory() {
    cd $1 && next_version=`bump_patch_version` && git add . && cd .. && echo ${next_version}
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

commit_version_bump() {
    git commit -m "Docker images released"
    git push

    git tag "browser-clients:$browserClientVersion"
    git tag "middleware:$middlewareVersion"

    git push "browser-clients:$browserClientVersion"
    git push "middleware:$middlewareVersion"
}

build_build_image && build_both_runtime_images && push_both_runtime_images && commit_version_bump

