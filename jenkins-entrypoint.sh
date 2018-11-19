#!/usr/bin/env bash

buildDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
browserClientsDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
middlewareDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"

build_build_image() {
    docker build --force-rm --target build --tag ${buildDockerImage} .
}

build_browser_clients_image() {
    docker build --force-rm --target browser-clients --tag ${browserClientsDockerImage} .
}

build_middleware_image() {
    docker build --force-rm --target middleware --tag ${middlewareDockerImage} .
}

build_build_image && build_browser_clients_image && build_middleware_image

# docker push ${browserClientsDockerImage}
# docker push ${middlewareDockerImage}
