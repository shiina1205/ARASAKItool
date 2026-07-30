#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.jsが見つかりません。https://nodejs.org/ からインストールしてください。"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "初回セットアップを行っています..."
  npm install
fi

if [ ! -f "Arasaki_Staff_Planner_v0_8_Deploy/assets/js/config.js" ]; then
  cp "Arasaki_Staff_Planner_v0_8_Deploy/assets/js/config.example.js" "Arasaki_Staff_Planner_v0_8_Deploy/assets/js/config.js"
fi

echo "Staff Plannerを起動します。"
echo "ブラウザで http://localhost:5173/?localPreview=1 を開いてください。"
echo "終了する場合は Ctrl+C を押します。"
npm run dev
