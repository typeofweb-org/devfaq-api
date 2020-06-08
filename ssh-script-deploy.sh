#!/bin/bash
set -e
source ~/.bash_profile

if [[ "$1" == "production" ]]; then
  SUBDOMAIN="api"
  BRANCH="master"
elif [[ "$1" == "staging" ]]; then
  SUBDOMAIN="staging-api"
  BRANCH="develop"
else
  echo 'Incorrect environment. "production" or "staging" allowed.'
  exit 1
fi

node -v
yarn -v

cd ~/domains/$SUBDOMAIN.devfaq.pl/public_nodejs

echo "BRANCH:" $BRANCH
echo "SUBDOMAIN" $SUBDOMAIN
echo "Current directory:" $(pwd)

echo "👉 Pulling from the server…"
git fetch origin --tags

if git diff --quiet remotes/origin/$BRANCH; then
  echo "👉 Up to date; nothing to do!"
  exit
fi

git pull origin $BRANCH

echo "👉 Installing deps…"
yarn install --frozen-lockfile
echo "👉 Bulding…"
NODE_ENV=production ENV=$1 yarn run build
echo "👉 Running migrations…"
NODE_ENV=production ENV=$1 yarn run db:migrate:up
echo `git rev-parse HEAD` > .version

echo "👉 Restarting the server…"
devil www restart $SUBDOMAIN.devfaq.pl
curl -I https://$SUBDOMAIN.devfaq.pl

echo "👉 Done! 😱 👍"
