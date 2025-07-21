# Web Client

React-based poker game interface with real-time gameplay.

## Features

- **Table Browser**: Browse and join poker tables
- **Game Interface**: Real-time poker table UI
- **Redux State**: Game state management with animations
- **WebSocket**: Direct connection to dedicated servers
- **Authentication**: JWT-based player authentication

## Architecture

```
React App
├── Redux Store
│   ├── Game Slice       # Game state & actions
│   └── Auth Slice       # Player authentication
├── Components
│   ├── Lobby            # Table browser
│   ├── Table            # Poker table UI
│   └── Game Controls    # Player actions
└── WebSocket Client     # Real-time connection
```

## Integration

- Fetches table list from master server API
- Connects directly to dedicated servers via WebSocket
- Real-time game state updates and animations