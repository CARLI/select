#!/usr/bin/env bash

force_rm=""
# force_rm="--force-rm"

buildDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
browserClientsDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
middlewareDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"

build_build_image() {
    docker build ${force_rm} --target build --tag ${buildDockerImage} .
}

build_browser_clients_image() {
    docker build ${force_rm} --target browser-clients --tag ${browserClientsDockerImage} .
}

build_middleware_image() {
    docker build ${force_rm} --target middleware --tag ${middlewareDockerImage} .
}

build_build_image && build_browser_clients_image && build_middleware_image

# docker push ${browserClientsDockerImage}
# docker push ${middlewareDockerImage}
