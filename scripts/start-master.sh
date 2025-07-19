#!/bin/bash

# Start Master Server only
echo "🎯 Starting Master Server..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if databases are running
print_status "Checking database services..."
if ! docker ps | grep -q "poker-postgres"; then
    print_status "Starting database services..."
    docker compose up postgres redis -d
    sleep 5
fi

print_success "Database services are running"

# Start master server
print_status "Starting Master Server on port 3001..."
cd apps/master-server

if [ ! -f ".env" ]; then
    print_error ".env file not found in master-server directory"
    exit 1
fi

npm run dev