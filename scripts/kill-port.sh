#!/bin/bash
# Kill process running on specified port(s)
# Usage: yarn kill:port                    # Kills both 8911 and 8912 (dev server ports)
#    or: PORT=8912 yarn kill:port          # Kills specific port
#    or: yarn kill:port 8912              # Kills specific port (if yarn forwards args)

# Get port from environment variable or first argument
PORT=${PORT:-${1:-}}

# If no port specified, kill both dev server ports (8911 and 8912)
if [ -z "$PORT" ]; then
  echo "Killing processes on dev server ports (8911 and 8912)..."
  PIDS_8911=$(lsof -ti:8911 2>/dev/null)
  PIDS_8912=$(lsof -ti:8912 2>/dev/null)

  if [ -z "$PIDS_8911" ] && [ -z "$PIDS_8912" ]; then
    echo "No processes found on ports 8911 or 8912"
    exit 0
  fi

  if [ -n "$PIDS_8911" ]; then
    echo "Killing process(es) $PIDS_8911 on port 8911"
    kill -9 $PIDS_8911 2>/dev/null
  fi

  if [ -n "$PIDS_8912" ]; then
    echo "Killing process(es) $PIDS_8912 on port 8912"
    kill -9 $PIDS_8912 2>/dev/null
  fi

  echo "Done"
  exit 0
fi

# Validate port is a number
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
  echo "Error: Port must be a number. Got: $PORT"
  echo "Usage: yarn kill:port                    # Kills both 8911 and 8912"
  echo "   or: PORT=8912 yarn kill:port         # Kills specific port"
  echo "   or: yarn kill:port 8912               # Kills specific port"
  exit 1
fi

# Kill specific port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "No process found running on port $PORT"
  exit 0
fi

echo "Killing process $PID on port $PORT"
kill -9 $PID 2>/dev/null
echo "Process killed"

