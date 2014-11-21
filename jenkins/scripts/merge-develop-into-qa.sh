#!/bin/sh

git fetch
git checkout qa
git merge --no-ff origin/develop
git push origin qa
