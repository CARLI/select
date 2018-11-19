#!/usr/bin/env bash

buildDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
browserClientsDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"
middlewareDockerImage="${CARLI_DOCKER_REGISTRY}/carli-select/build:${BUILD_NUMBER}"

docker build --target build --tag ${buildDockerImage} .
docker build --target browser-clients --tag ${browserClientsDockerImage} .
docker build --target middleware --tag ${middlewareDockerImage} .

# docker push ${browserClientsDockerImage}
# docker push ${middlewareDockerImage}