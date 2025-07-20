# PokerLulu Web Client

A modern React-based web client for the PokerLulu poker game platform.

## Features

- **User Authentication**: Login, registration, and profile management
- **Game Lobby**: Browse and join poker tables
- **Live Poker Game**: Real-time poker gameplay with WebSocket support
- **Player Profiles**: View statistics, achievements, and settings
- **Leaderboard**: Competitive rankings and player statistics
- **In-Game Chat**: Real-time communication with other players
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication
- **Axios** for HTTP requests
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running master server (port 3001)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── game/           # Game-related components
│   ├── layout/         # Layout components
│   ├── lobby/          # Lobby components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── store/              # Redux store and slices
└── types/              # TypeScript type definitions
```

## Key Components

### Game Components

- **PokerTable**: Main game interface with player positions
- **PlayerSeat**: Individual player display with cards and chips
- **PlayerControls**: Betting and action controls
- **GameChat**: In-game chat system
- **GameSettings**: Game configuration modal

### Authentication

- **LoginPage**: User login form
- **RegisterPage**: User registration form
- **ProfilePage**: User profile and statistics
- **ProtectedRoute**: Route protection for authenticated users

### Lobby

- **LobbyPage**: Table browsing and joining
- **TableList**: List of available tables
- **CreateTableModal**: Create new private tables
- **PlayerStats**: Player statistics display

## API Integration

The client integrates with the PokerLulu master server API:

- **Authentication**: `/api/auth/*`
- **Player Management**: `/api/players/*`
- **Table Management**: `/api/tables/*`
- **Game Matching**: `/api/matching/*`
- **Server Management**: `/api/servers/*`

## WebSocket Integration

Real-time game features use WebSocket connections:

- Live game updates
- Player actions (bet, fold, etc.)
- Chat messages
- Table state changes

## Styling

The application uses Tailwind CSS with custom poker-themed colors:

- `poker-green`: Primary brand color (#10B981)
- `brown-600`: Table border color (#92400E)

Custom animations are included for:
- Card dealing
- Chip flipping
- UI transitions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture
- Redux for state management

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production API endpoints

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include proper error handling
4. Test thoroughly before submitting
5. Update documentation as needed

## License

This project is part of the PokerLulu platform. 