#!/bin/bash

# Start all services in production mode with Docker
echo "🏭 Starting Poker Game in Production Mode..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build all services
print_status "Building production images..."
if npm run build; then
    print_success "All packages built successfully"
else
    print_error "Failed to build packages"
    exit 1
fi

# Start all services with Docker Compose
print_status "Starting all services with Docker Compose..."
print_status "This will start:"
echo "  - PostgreSQL Database"
echo "  - Redis Cache"
echo "  - Master Server (port 3001)"
echo "  - Dedicated Server 1 (port 3002)"
echo "  - Dedicated Server 2 (port 3003)"
echo "  - AI Server (port 3004)"
echo "  - Nginx Load Balancer (port 80)"
echo ""

if docker compose up -d; then
    print_success "All services started successfully!"
    echo ""
    echo "🌐 Production URLs:"
    echo "  Web Application: http://localhost"
    echo "  Master Server API: http://localhost:3001"
    echo "  Dedicated Server 1: http://localhost:3002"
    echo "  Dedicated Server 2: http://localhost:3003"
    echo "  AI Server: http://localhost:3004"
    echo ""
    echo "📊 Management Commands:"
    echo "  View logs: docker compose logs -f"
    echo "  Stop services: docker compose down"
    echo "  Restart service: docker compose restart <service-name>"
else
    print_error "Failed to start services"
    exit 1
fi