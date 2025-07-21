# Dedicated Server

Poker game engine with real-time multiplayer sessions.

## What it does
- Runs Texas Hold'em poker games
- Manages multiple tables simultaneously  
- Handles player connections via WebSocket
- Tracks game statistics and hand history

## Key Components
- **Session Orchestrator**: Main game controller
- **Game Flow Manager**: Handles betting rounds and phases
- **Hand Manager**: Deals cards and processes actions
- **Statistics**: Tracks player performance

## Usage
```bash
npm start  # Starts server on port 3001
```

Automatically registers with master server and reports table status.