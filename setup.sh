#!/bin/bash

# Poker Game Setup Script
echo "🎰 Setting up Poker Game Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+ and try again."
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

print_success "Docker $(docker --version | cut -d ' ' -f 3 | cut -d ',' -f 1) detected"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_success "Docker Compose detected"

# Step 1: Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Create environment files
print_status "Setting up environment files..."
if [ ! -f .env ]; then
    print_warning ".env file not found, copying from .env.example"
    cp .env.example .env
fi

# Copy .env to all service directories
cp .env apps/master-server/.env
cp .env apps/dedicated-server/.env  
cp .env apps/ai-server/.env
cp .env packages/database/.env

print_success "Environment files configured"

# Step 3: Start database services
print_status "Starting database services..."
if docker compose up postgres redis -d; then
    print_success "Database services started"
else
    print_error "Failed to start database services"
    exit 1
fi

# Wait for databases to be ready
print_status "Waiting for databases to be ready..."
sleep 10

# Step 4: Setup database schema
print_status "Setting up database schema..."
cd packages/database
if npx prisma db push; then
    print_success "Database schema created"
else
    print_error "Failed to create database schema"
    exit 1
fi

if npx prisma generate; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

cd ../..

# Step 5: Build all packages
print_status "Building packages..."
if npm run build; then
    print_success "All packages built successfully"
else
    print_error "Failed to build packages"
    exit 1
fi

# Step 6: Run tests
print_status "Running tests..."
cd apps/master-server
if npm test; then
    print_success "Tests passed"
else
    print_warning "Some tests failed, but continuing setup"
fi

cd ../..

print_success "🎉 Setup complete!"
echo ""
echo "🚀 To start the services:"
echo "  Development mode: npm run dev"
echo "  Individual services:"
echo "    Master Server: npm run start:master"
echo "    Dedicated Server: npm run start:dedicated" 
echo "    AI Server: npm run start:ai"
echo "    Web Client: npm run start:client"
echo ""
echo "🌐 Service URLs:"
echo "  Web Client: http://localhost:3000"
echo "  Master Server: http://localhost:3001"
echo "  Dedicated Server: http://localhost:3002"
echo "  AI Server: http://localhost:3003"
echo ""
echo "🔍 Database:"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  Prisma Studio: npx prisma studio (in packages/database/)"