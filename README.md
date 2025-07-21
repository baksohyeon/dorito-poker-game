# POKER GAME ENGINE

A modern, scalable poker platform featuring real-time gameplay, AI analysis, and a beautiful React frontend.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm 9+
- Docker and Docker Compose
- Git (for cloning)

### One-Command Setup
```bash
# Install and setup everything
npm run setup
```

### Start Development Environment
```bash
# Start all services with hot reload
npm run dev

# Or start services individually:
npm run start:master     # Master Server (port 3001)
npm run start:dedicated  # Dedicated Server (port 3002)
npm run start:ai        # AI Server (port 3003)
npm run start:client    # Web Client (port 3000)
```

## 🌐 Service Architecture

### Core Services

1. **Master Server** (Port 3001)
   - Player authentication & matching
   - Server health monitoring
   - Table management

2. **Dedicated Server** (Port 3002)
   - Real-time poker game engine
   - WebSocket communication
   - Game state management

3. **AI Server** (Port 3003)
   - Hand strength analysis
   - Player pattern recognition
   - Strategy recommendations

4. **Web Client** (Port 3000)
   - React-based UI
   - Real-time game updates
   - Responsive design

### Infrastructure

- **PostgreSQL**: Game data & user management
- **Redis**: Real-time data & caching
- **Docker**: Service containerization
- **Nginx**: Production load balancing

## 📁 Project Structure

```
pokerlulu/
├── apps/                    # Service applications
│   ├── master-server/      # Authentication & matching
│   ├── dedicated-server/   # Game engine
│   ├── ai-server/         # AI analysis
│   └── web-client/        # React frontend
├── packages/              # Shared libraries
│   ├── database/         # Prisma & repositories
│   ├── shared/           # Common utilities
│   └── logger/           # Logging system
├── scripts/              # Utility scripts
├── docs/                 # Documentation
└── docker-compose.yml    # Container orchestration
```

## 🛠️ Development Commands

### Database Management
```bash
npm run db:setup    # Setup schema
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset database (⚠️ Deletes data)
```

### Docker Operations
```bash
npm run docker:up    # Start infrastructure
npm run docker:down  # Stop all containers
npm run logs         # View service logs
```

### Build & Test
```bash
npm run build       # Build all packages
npm run test        # Run all tests
npm run lint        # Check code style
npm run clean       # Clean artifacts
```

## 🔧 Configuration

### Environment Variables
The `.env` file configures all services:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/poker_game"
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"

# Service Ports
MASTER_SERVER_PORT=3001
DEDICATED_SERVER_PORT=3002
AI_SERVER_PORT=3003
WEB_CLIENT_PORT=3000

# Game Settings
MAX_TABLES_PER_SERVER=20
MAX_PLAYERS_PER_TABLE=9
DEFAULT_CHIPS=1000
```

## 🔍 Monitoring & Debugging

### Service Health Checks
```bash
curl http://localhost:3001/health  # Master Server
curl http://localhost:3002/health  # Dedicated Server
curl http://localhost:3003/health  # AI Server
```

### Logs
```bash
# All services
npm run logs

# Single service
docker logs poker-master -f
```

### Database Tools
```bash
# Prisma Studio
npm run db:studio

# Redis CLI
docker exec -it poker-redis redis-cli
```

## 🚀 Production Deployment

### Build for Production
```bash
# Build all services
npm run docker:build

# Start production stack
npm run docker:up
```

### Production URLs
- Web App: http://localhost (port 80)
- API Services: Same ports as development

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker ps | grep postgres
   
   # Restart database
   docker compose restart postgres
   ```

2. **Port Conflicts**
   ```bash
   # Find process using port
   lsof -i :3001
   
   # Kill process
   kill -9 $(lsof -t -i:3001)
   ```

3. **Build Errors**
   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build
   ```

## 📚 Additional Resources

- [API Documentation](docs/api/)
- [Architecture Guide](docs/architecture/)
- [Deployment Guide](docs/deployment/)
- [Contributing Guide](docs/development/contributing.md)

## 🔒 Security Notes

- Change default JWT secret in production
- Enable HTTPS in production
- Configure proper firewall rules
- Set up rate limiting

## 🎮 Features

- ♠️ Real-time Texas Hold'em gameplay
- 🤖 AI-powered strategy analysis
- 📊 Player statistics and tracking
- 🔄 Automatic table balancing
- 💬 In-game chat system
- 🎯 Tournament support
- 📱 Responsive design

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

Happy gaming! 🎰
```mermaid
flowchart LR
    %% Web Client
    subgraph WebClient["Web Client"]
        GameSlice["Game Slice (Redux)"]
        WebSocket["WebSocket Connection"]
    end

    %% Master Server
    subgraph MasterServer["Master Server"]
        TableRoutes["Table Routes (API)"]
        ServerRegistry["Server Registry"]
    end

    %% Dedicated Server
    subgraph DedicatedServer["Dedicated Server"]
        Orchestrator["Orchestrator"]
        GameFlow["Game Flow Manager"]
    end

    %% Connections
    GameSlice <---> TableRoutes
    WebSocket <---> ServerRegistry

    TableRoutes <---> Orchestrator
    Orchestrator --> GameFlow
  ```