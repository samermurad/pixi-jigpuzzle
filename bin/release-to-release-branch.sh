#!/usr/bin/env bash


BRANCH_NOW=$(git branch | grep "*" | tr -d "*" | tr -d " " | tr -d "\n")
BRANCH="${1:-release}"


if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  echo "==> Working directory clean"
else
  echo "==> Cant run with uncommited changes"
  echo "======="
  echo "$(git status --porcelain)"
  echo "======="
  # Uncommitted changes
  exit 130
fi

echo "==> Updating repo ($BRANCH)…"

git fetch

git checkout $BRANCH

git pull

git merge $BRANCH origin/$BRANCH_NOW

