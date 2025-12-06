#!/bin/bash

echo "========================================"
echo "Final Desktop App Rebuild & Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0.31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Step 1: Cleanup all processes..."
killall -9 app 2>/dev/null
killall -9 node 2>/dev/null
pkill -9 -f "rw serve" 2>/dev/null
sleep 3

echo "Step 2: Check ports are free..."
if lsof -i :8911 >/dev/null 2>&1; then
    echo -e "${RED}Port 8911 still in use!${NC}"
    lsof -t -i :8911 | xargs kill -9
    sleep 2
fi

if lsof -i :8912 >/dev/null 2>&1; then
    echo -e "${RED}Port 8912 still in use!${NC}"
    lsof -t -i :8912 | xargs kill -9
    sleep 2
fi

echo -e "${GREEN}Ports are free${NC}"
echo ""

echo "Step 3: Rebuild Redwood..."
cd /home/jon/code/llm-ui
yarn rw build || { echo -e "${RED}Redwood build failed!${NC}"; exit 1; }
echo -e "${GREEN}Redwood build complete${NC}"
echo ""

echo "Step 4: Rebuild Tauri desktop app..."
cd src-tauri
cargo build --release || { echo -e "${RED}Tauri build failed!${NC}"; exit 1; }
echo -e "${GREEN}Tauri build complete${NC}"
echo ""

echo "Step 5: Starting desktop app..."
echo "This will start both:"
echo "  - API server on http://localhost:8911"
echo "  - Web server on http://localhost:8912"
echo "  - Desktop window pointing to localhost:8912"
echo ""
cd /home/jon/code/llm-ui
./src-tauri/target/release/app &
APP_PID=$!
echo "App PID: $APP_PID"
echo ""

echo "Waiting 15 seconds for both servers to start..."
sleep 15

echo ""
echo "Step 6: Testing API server..."
if curl -s http://localhost:8911/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}' | grep -q "Query"; then
    echo -e "${GREEN}✅ API server responding!${NC}"
else
    echo -e "${RED}❌ API server not responding${NC}"
fi

echo ""
echo "Step 7: Testing Web server..."
if curl -s http://localhost:8912 | grep -q "html"; then
    echo -e "${GREEN}✅ Web server responding!${NC}"
else
    echo -e "${RED}❌ Web server not responding${NC}"
fi

echo ""
echo "========================================"
echo "Desktop app should now be working!"
echo "Check the window - you should see the UI"
echo ""
echo "Press Enter to stop the app and test cleanup..."
read

echo ""
echo "Stopping app..."
kill -TERM $APP_PID
sleep 3

echo "Checking if ports were released..."
if lsof -i :8911 >/dev/null 2>&1 || lsof -i :8912 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Ports still in use after shutdown${NC}"
    lsof -i :8911 2>/dev/null
    lsof -i :8912 2>/dev/null
    echo "Forcing cleanup..."
    killall -9 node
else
    echo -e "${GREEN}✅ Ports released successfully!${NC}"
fi

echo ""
echo "========================================"
echo "Test complete!"
echo "========================================"

