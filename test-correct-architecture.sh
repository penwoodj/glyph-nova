#!/bin/bash

echo "========================================="
echo "Desktop App Final Test - Correct Architecture"
echo "========================================="
echo "Architecture:"
echo "  - Tauri serves static files from web/dist"
echo "  - API server on port 8911 for GraphQL"
echo "  - Frontend connects to API at localhost:8911"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Step 1: Cleanup..."
killall -9 app node 2>/dev/null
pkill -9 -f "rw serve" 2>/dev/null
sleep 3

if lsof -i :8911 >/dev/null 2>&1; then
    lsof -t -i :8911 | xargs kill -9
    sleep 2
fi
echo -e "${GREEN}✅ Ports clear${NC}"
echo ""

echo "Step 2: Rebuild Redwood..."
cd /home/jon/code/llm-ui
yarn rw build || exit 1
echo -e "${GREEN}✅ Redwood built${NC}"
echo ""

echo "Step 3: Rebuild Tauri..."
cd src-tauri
cargo build --release || exit 1
echo -e "${GREEN}✅ Tauri built${NC}"
echo ""

echo "Step 4: Testing..."
cd /home/jon/code/llm-ui
./src-tauri/target/release/app &
APP_PID=$!
echo "App PID: $APP_PID"
echo ""

echo "Waiting 8 seconds for API server..."
sleep 8

echo "Testing API..."
if curl -s http://localhost:8911/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}' | grep -q "Query"; then
    echo -e "${GREEN}✅ API responding!${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi

echo ""
echo "========================================"
echo "Check the desktop window!"
echo "You should see the UI loaded from static files"
echo ""
echo "Press Enter to stop..."
read

kill -TERM $APP_PID
sleep 2

if lsof -i :8911 >/dev/null 2>&1; then
    echo -e "${RED}⚠️  Port still in use${NC}"
    killall -9 node
else
    echo -e "${GREEN}✅ Port released!${NC}"
fi

echo "Done!"


