# 🎰 Poker Game - Startup Guide

A complete real-time multiplayer poker game with AI analysis, built with Node.js, React, PostgreSQL, and Redis.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm 9+**
- **Docker** and **Docker Compose**
- **Git** (for cloning)

### One-Command Setup
```bash
npm run setup
```

This will:
- ✅ Check all prerequisites
- ✅ Install all dependencies  
- ✅ Start database services (PostgreSQL + Redis)
- ✅ Setup database schema
- ✅ Build all packages
- ✅ Run tests

### Start Services

#### Development Mode (Recommended)
```bash
 npx prisma db push
# Start all services with hot reload
npm run start
# or
npm run dev
```

#### Individual Services
```bash
npm run start:master      # Master Server (port 3001)
npm run start:dedicated   # Dedicated Server (port 3002)
npm run start:ai          # AI Server (port 3003) 
npm run start:client      # Web Client (port 3000)
```

#### Production Mode
```bash
npm run start:prod
```

## 🌐 Service URLs

### Development
- **🎮 Web Client**: http://localhost:3000
- **🎯 Master Server API**: http://localhost:3001
- **🎲 Dedicated Server**: http://localhost:3002
- **🤖 AI Server**: http://localhost:3003
- **🗄️ Database**: localhost:5432
- **🔄 Redis**: localhost:6379

### Production
- **🌍 Web Application**: http://localhost (port 80)
- **⚙️ API Services**: Same ports as development

## 📁 Project Structure

```
poker-game/
├── apps/                    # Applications
│   ├── master-server/       # Player matching & auth
│   ├── dedicated-server/    # Game engine
│   ├── ai-server/          # AI analysis
│   └── web-client/         # React frontend
├── packages/               # Shared packages
│   ├── database/           # Prisma & repositories
│   ├── shared/             # Common utilities
│   └── logger/             # Logging utilities
├── scripts/                # Startup scripts
├── setup.sh               # One-command setup
└── docker-compose.yml     # Production deployment
```

## 🛠️ Management Commands

### Database
```bash
npm run db:setup      # Setup database schema
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database (⚠️ destroys data)
```

### Docker
```bash
npm run docker:up     # Start databases only
npm run docker:down   # Stop all Docker services
npm run logs          # View all service logs
npm run stop          # Stop all services
```

### Development
```bash
npm run build         # Build all packages
npm run test          # Run all tests
npm run lint          # Check code style
npm run clean         # Clean build artifacts
```

## 🏗️ Service Architecture

### Master Server (`apps/master-server`)
- **Purpose**: Authentication, player matching, server management
- **Port**: 3001
- **Tech**: Express.js, JWT, Redis
- **Features**: 
  - User registration/login
  - Server health monitoring
  - Player queue management

### Dedicated Server (`apps/dedicated-server`)
- **Purpose**: Real-time poker game engine
- **Port**: 3002
- **Tech**: Socket.IO, Express.js
- **Features**:
  - Texas Hold'em game logic
  - Real-time player communication
  - Hand evaluation

### AI Server (`apps/ai-server`)
- **Purpose**: Poker strategy analysis
- **Port**: 3003
- **Tech**: TensorFlow.js, Bull Queue
- **Features**:
  - Hand strength analysis
  - Player pattern recognition
  - Strategy recommendations

### Web Client (`apps/web-client`)
- **Purpose**: Player interface
- **Port**: 3000
- **Tech**: React, Redux, Socket.IO
- **Features**:
  - Game table interface
  - Real-time game updates
  - Player statistics

## 🔧 Configuration

### Environment Variables
All services use the same `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/poker_game"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Server Ports
MASTER_SERVER_PORT=3001
DEDICATED_SERVER_PORT=3002
AI_SERVER_PORT=3003
WEB_CLIENT_PORT=3000

# Game Settings
MAX_TABLES_PER_SERVER=20
MAX_PLAYERS_PER_TABLE=9
DEFAULT_CHIPS=1000
```

### Docker Configuration
Services are orchestrated via `docker-compose.yml`:
- **PostgreSQL 15** with persistent storage
- **Redis 7** for caching and pub/sub
- **Nginx** for load balancing (production)
- **Network isolation** for security

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep postgres

# Restart database
docker compose restart postgres

# Check database logs
docker logs poker-postgres
```

### Port Conflicts
```bash
# Check what's using port 3001
lsof -i :3001

# Kill process using port
kill -9 $(lsof -t -i:3001)
```

### Build Issues
```bash
# Clean and reinstall
npm run clean
npm install
npm run build
```

### Service Health Check
```bash
# Master Server
curl http://localhost:3001/health

# Dedicated Server  
curl http://localhost:3002/health

# AI Server
curl http://localhost:3003/health
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Individual Service Tests
```bash
cd apps/master-server && npm test      # Auth & API tests
cd apps/dedicated-server && npm test   # Game logic tests
cd apps/ai-server && npm test          # AI analysis tests
```

### Integration Tests
```bash
# Start services first
npm run start:dev

# In another terminal
npm run test:integration
```

## 📊 Monitoring

### Logs
```bash
# All services
npm run logs

# Specific service
docker logs poker-master

# Follow logs
docker logs -f poker-master
```

### Database Admin
```bash
# Open Prisma Studio
npm run db:studio
```

### Redis CLI
```bash
# Connect to Redis
docker exec -it poker-redis redis-cli
```

## 🔒 Security

### Development
- Default JWT secret (change for production)
- Database accessible on localhost
- CORS enabled for development

### Production
- Environment-specific secrets
- Database network isolation
- HTTPS termination via Nginx
- Rate limiting enabled

## 🚀 Deployment

### Development
Services run with hot reload for development efficiency.

### Production
All services containerized with:
- Multi-stage builds for optimization
- Health checks for reliability
- Horizontal scaling support
- Load balancing via Nginx

---

## 🎮 Ready to Play!

After setup, visit http://localhost:3000 to start playing poker! 

The system supports:
- ♠️ **Multiple simultaneous games**
- 👥 **Real-time multiplayer**
- 🤖 **AI-powered analysis**
- 📊 **Player statistics**
- 🔄 **Automatic reconnection**

Happy gaming! 🎰