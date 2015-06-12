#!/bin/bash

docker="sudo docker"

create-data-container-if-not-exists() {
    ${docker} inspect carli-data-${CARLI_INSTANCE} 2>&1 > /dev/null
    data_container_status=$?

    # Do not recreate the data container if it already exists.
    # The point of this container is persist the data storage.
    # If a reset is needed, the container should be manually removed.
    if [ ${data_container_status} -eq 1 ]; then
        ${docker} run \
            --name "carli-data-$CARLI_INSTANCE" \
            carli-couchdb:${CARLI_DOCKER_TAG} \
            /bin/echo Couch Data-only Container
    fi
}

create-couchdb-container() {
    ${docker} run \
        --name="carli-couchdb-${CARLI_INSTANCE}" \
        --volumes-from "carli-data-${CARLI_INSTANCE}" \
        --detach=true \
        --log-driver=syslog \
        -p ${CARLI_COUCHDB_HOST_PORT}:5984 \
        carli-couchdb:${CARLI_DOCKER_TAG}
}

destroy-couchdb-container() {
    ${docker} rm -f carli-couchdb-${CARLI_INSTANCE} 2> /dev/null
}

recreate-couchdb-container() {
    destroy-couchdb-container
    create-couchdb-container
}

create-middleware-container() {
    ${docker} run \
        --name="carli-middleware-${CARLI_INSTANCE}" \
        --detach=true \
        --log-driver=syslog \
        --link=carli-couchdb-${CARLI_INSTANCE}:carli-couchdb \
        --volumes-from "carli-assets-${CARLI_INSTANCE}" \
        -e "CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD" \
        -p 3000 \
        --workdir=/carli-select/middleware \
        carli-build:${CARLI_DOCKER_TAG} /carli-select/docker/build/serve-middleware.sh
}

destroy-middleware-container() {
    ${docker} rm -f carli-middleware-${CARLI_INSTANCE} 2> /dev/null
}

recreate-middleware-container() {
    destroy-middleware-container
    create-middleware-container
}

create-assets-container() {
    ${docker} run \
        --name "carli-assets-$CARLI_INSTANCE" \
        carli-build:${CARLI_DOCKER_TAG} \
        /bin/echo CARLI assets container
}

destroy-assets-container() {
    ${docker} rm -f carli-assets-${CARLI_INSTANCE} 2> /dev/null
}

recreate-assets-container() {
    destroy-assets-container
    create-assets-container
}

create-serve-container() {
    ${docker} run \
        --name="carli-serve-${CARLI_INSTANCE}" \
        --detach=true \
        --log-driver=syslog \
        --link=carli-couchdb-${CARLI_INSTANCE}:carli-couchdb \
        --link=carli-middleware-${CARLI_INSTANCE}:carli-middleware \
        --volumes-from "carli-assets-${CARLI_INSTANCE}" \
        -p ${CARLI_NGINX_HOST_PORT}:80 \
        carli-nginx:${CARLI_DOCKER_TAG}
}

destroy-serve-container() {
    ${docker} rm -f carli-serve-${CARLI_INSTANCE} 2> /dev/null
}

recreate-serve-container() {
    destroy-serve-container
    create-serve-container
}

run-in-container() {
    command=$1
    workdir=$2
    extra_arguments=$3

    if [ -z "$workdir" ]; then
        workdir='/carli-select'
    fi

    ${docker} run --rm -t \
        --volumes-from=carli-assets-${CARLI_INSTANCE} \
        --workdir=${workdir} \
        ${extra_arguments} carli-build:${CARLI_DOCKER_TAG} ${command}
}

install-build-dependencies() {
    run-in-container ./install-dependencies.sh
}

configure-javascript-for-node() {
    run-in-container "grunt jsenv:node" /carli-select/config
}

ensure-local-config() {
    run-in-container "grunt ensure-local-config" /carli-select/config
}

generate-config() {
    run-in-container "grunt generate-config:$CARLI_INSTANCE" /carli-select/jenkins \
        "-e \"CARLI_CRM_MYSQL_PASSWORD=$CARLI_CRM_MYSQL_PASSWORD\" --link=carli-couchdb-$CARLI_INSTANCE:carli-couchdb"
}

install-dependencies-and-configure() {
    install-build-dependencies &&
    configure-javascript-for-node &&
    ensure-local-config &&
    generate-config
}

build-browser-clients() {
    run-in-container "grunt build" /carli-select/browserClient
}

create-couchdb-admin() {
    ${docker} run --rm \
        --link=carli-couchdb-${CARLI_INSTANCE}:carli-couchdb \
        --volumes-from "carli-assets-${CARLI_INSTANCE}" \
        --workdir=/carli-select \
        carli-build:${CARLI_DOCKER_TAG} grunt create-admin-user
}

redeploy-carli() {
    echo "Creating data container, if needed" && create-data-container-if-not-exists &&
    echo "Redeploying CouchDB" && recreate-couchdb-container &&
    echo "Redeploying CARLI Assets" && recreate-assets-container &&
    echo "Installing dependencies and configuring containers" && install-dependencies-and-configure &&
    echo "Redeploying Middleware" && recreate-middleware-container &&
    echo "Building the browser clients" && build-browser-clients &&
    echo "Redeploying web server" && recreate-serve-container &&
    echo "Creating CouchDB Admin" && create-couchdb-admin
}
