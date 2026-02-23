#!/usr/bin/env bash
set -euo pipefail

SERVER="root@188.40.218.82"
APP_DIR="/opt/publicratos"

echo "==> Deploying to $SERVER"

echo "==> Ensuring server has Docker..."
ssh $SERVER 'command -v docker >/dev/null 2>&1 || {
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
}'

echo "==> Syncing project files..."
rsync -az --exclude='node_modules' --exclude='.svelte-kit' --exclude='.git' --exclude='.env' \
  -e ssh ./ $SERVER:$APP_DIR/

echo "==> Copying production env..."
scp .env.production $SERVER:$APP_DIR/.env

echo "==> Building and starting containers..."
ssh $SERVER "cd $APP_DIR && docker compose -f docker-compose.prod.yml up -d --build"

echo "==> Running database migrations..."
ssh $SERVER "cd $APP_DIR && docker compose -f docker-compose.prod.yml exec app npx drizzle-kit migrate"

echo ""
echo "==> Deployed! Site should be live at https://publicrata.eu"
echo "    (HTTPS certificate may take a minute on first deploy)"
