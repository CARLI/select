#!/bin/sh

bower_options="--allow-root --config.interactive=false"

npm install || exit 1

maybe_install_browser_dependencies() {
    if [ -d "./browserClient" ]; then
        cd ./browserClient && npm install && node_modules/.bin/bower $bower_options install && cd -
    else
        true
    fi
}

maybe_npm_install() {
    dir="$1"

    if [ -d "$dir" ]; then
        cd $dir && npm install && cd - > /dev/null
    else
        true
    fi
}

maybe_install_browser_dependencies &&
maybe_npm_install ./CARLI &&
maybe_npm_install ./config &&
maybe_npm_install ./db &&
maybe_npm_install ./middleware

