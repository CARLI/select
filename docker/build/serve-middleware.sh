#!/bin/sh

cd /carli-select && grunt jsenv:node
cd /carli-select/middleware && forever ./index.js
