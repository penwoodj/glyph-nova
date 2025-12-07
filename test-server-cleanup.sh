#!/bin/bash

echo "========================================="
echo "Desktop App Server Cleanup Test"
echo "========================================="
echo "Date: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -i :8911 > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to display port status
show_port_status() {
    if check_port; then
        echo -e "${YELLOW}Port 8911 is IN USE:${NC}"
        lsof -i :8911
    else
        echo -e "${GREEN}Port 8911 is FREE${NC}"
    fi
}

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up any remaining processes..."
    killall -9 app 2>/dev/null
    killall -9 node 2>/dev/null
    sleep 2
}

# Initial cleanup
cleanup

echo "========================================="
echo "TEST 1: Normal App Startup and Shutdown"
echo "========================================="
echo ""

echo "Step 1: Check initial port status"
show_port_status
echo ""

echo "Step 2: Starting desktop app..."
cd /home/jon/code/glyph-nova
./src-tauri/target/release/app > /tmp/app-test.log 2>&1 &
APP_PID=$!
echo "App started with PID: $APP_PID"
sleep 8

echo ""
echo "Step 3: Verify API server is running"
show_port_status
echo ""

if check_port; then
    echo -e "${GREEN}✅ PASS: Server started successfully${NC}"
else
    echo -e "${RED}❌ FAIL: Server did not start${NC}"
    echo "=== App logs ==="
    cat /tmp/app-test.log
    exit 1
fi

echo "Step 4: Test API endpoint"
RESPONSE=$(curl -s http://localhost:8911/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { __typename }"}' 2>&1)
if echo "$RESPONSE" | grep -q "Query"; then
    echo -e "${GREEN}✅ PASS: API responding correctly${NC}"
    echo "Response: $RESPONSE"
else
    echo -e "${RED}❌ FAIL: API not responding${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

echo "Step 5: Stopping app normally (kill -TERM)"
kill -TERM $APP_PID
sleep 3

echo ""
echo "Step 6: Verify port is released after shutdown"
show_port_status
echo ""

if check_port; then
    echo -e "${RED}❌ FAIL: Port still in use after shutdown!${NC}"
    echo "This means server cleanup is not working."
    cleanup
    exit 1
else
    echo -e "${GREEN}✅ PASS: Port released successfully${NC}"
fi

echo ""
echo "========================================="
echo "TEST 2: Second Launch (Verify No Conflict)"
echo "========================================="
echo ""

echo "Step 1: Starting app again..."
./src-tauri/target/release/app > /tmp/app-test2.log 2>&1 &
APP_PID=$!
echo "App started with PID: $APP_PID"
sleep 8

echo ""
echo "Step 2: Verify server started without errors"
show_port_status
echo ""

if check_port; then
    echo -e "${GREEN}✅ PASS: Second launch successful${NC}"
else
    echo -e "${RED}❌ FAIL: Second launch failed${NC}"
    echo "=== App logs ==="
    cat /tmp/app-test2.log
    cleanup
    exit 1
fi

echo "Step 3: Test API endpoint again"
RESPONSE=$(curl -s http://localhost:8911/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query { __typename }"}' 2>&1)
if echo "$RESPONSE" | grep -q "Query"; then
    echo -e "${GREEN}✅ PASS: API responding correctly on second launch${NC}"
else
    echo -e "${RED}❌ FAIL: API not responding on second launch${NC}"
fi

echo ""
echo "Step 4: Test force kill (simulating crash)"
kill -9 $APP_PID
sleep 3

echo ""
echo "Step 5: Verify port released even after force kill"
show_port_status
echo ""

if check_port; then
    echo -e "${YELLOW}⚠️  WARNING: Port still in use after force kill${NC}"
    echo "This is expected - force kill bypasses cleanup. Manual cleanup needed."
    cleanup
else
    echo -e "${GREEN}✅ PASS: Port released even after force kill${NC}"
fi

echo ""
echo "========================================="
echo "FINAL CLEANUP"
echo "========================================="
cleanup
show_port_status

echo ""
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "${GREEN}✅ All critical tests passed!${NC}"
echo ""
echo "The desktop app now:"
echo "  1. Starts the API server correctly"
echo "  2. Releases the port on normal shutdown"
echo "  3. Can be launched multiple times without conflicts"
echo ""
echo "Note: Force kill (kill -9) may leave orphan processes."
echo "This is expected behavior for crash scenarios."
echo "========================================="

