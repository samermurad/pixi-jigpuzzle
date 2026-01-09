#!/usr/bin/env bash

docker compose up --build build-local-remote

VERION=$(cat package.json | grep \"version\" | tr -d "\"version:, ")
git add ./.dist-remote/build.zip

git commit -m "bundled VERION: $VERION"

git push
