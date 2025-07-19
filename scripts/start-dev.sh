#!/bin/bash

# Start all services in development mode
echo "🎰 Starting Poker Game Services in Development Mode..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if databases are running
print_status "Checking database services..."
if ! docker ps | grep -q "poker-postgres"; then
    print_status "Starting database services..."
    docker compose up postgres redis -d
    sleep 5
fi

print_success "Database services are running"

# Start all services in parallel using turbo
print_status "Starting all services in development mode..."
print_status "Services will start on the following ports:"
echo "  - Master Server: http://localhost:3001"
echo "  - Dedicated Server: http://localhost:3002"  
echo "  - AI Server: http://localhost:3003"
echo "  - Web Client: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

npm run dev