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

force_rm=""
# force_rm="--force-rm"

buildDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
browserClientsDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/browser-clients:${BUILD_NUMBER}"
middlewareDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/middleware:${BUILD_NUMBER}"

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

build_build_image && build_both_runtime_images && push_both_runtime_images

