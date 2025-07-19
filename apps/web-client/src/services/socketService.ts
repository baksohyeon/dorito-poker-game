<<<<<<< Updated upstream
import { io, Socket } from 'socket.io-client'
import { store } from '../store'
import { 
  updateGameState, 
  processActionResult, 
  playerJoined, 
  playerLeft, 
  setConnectionStatus,
  reconnectToGame,
  handlePlayerTimeout,
  addToHandHistory
} from '../store/slices/gameSlice'
import { 
  updateTable, 
  playerJoinedTable, 
  playerLeftTable 
} from '../store/slices/tableSlice'
import { 
  addMessage, 
  addSystemMessage,
  addTypingUser,
  removeTypingUser
} from '../store/slices/chatSlice'
import { 
  addNotification 
} from '../store/slices/uiSlice'
import { 
  updateTable as updateLobbyTable,
  removeTable,
  updateLobbyStats
} from '../store/slices/lobbySlice'
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  GameState,
  PlayerAction,
  ChatMessage,
  Table,
  PlayerState
} from '../types'

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnecting = false
  private lastPingTime = 0
  private connectionTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.setupEventListeners()
  }

  // Connection management
  connect(serverUrl: string = process.env.VITE_SOCKET_URL || 'http://localhost:3000'): Promise<void> {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return Promise.resolve()
    }

    this.isConnecting = true
    store.dispatch(setConnectionStatus('connecting'))

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          timeout: 10000,
          transports: ['websocket', 'polling'],
          auth: {
            token: store.getState().auth.token,
          },
          query: {
            clientVersion: '1.0.0',
          },
        })

        this.setupSocketEventListeners()

        this.socket.on('connect', () => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          store.dispatch(setConnectionStatus('connected'))
          this.startHeartbeat()
          
          store.dispatch(addNotification({
            type: 'success',
            title: 'Connected',
            message: 'Connected to poker server',
            duration: 3000,
          }))
          
          resolve()
        })

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false
          this.handleConnectionError(error)
          reject(error)
        })

        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false
            reject(new Error('Connection timeout'))
          }
        }, 15000)

      } catch (error) {
        this.isConnecting = false
        store.dispatch(setConnectionStatus('disconnected'))
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.stopHeartbeat()
      this.socket.disconnect()
      this.socket = null
    }
    store.dispatch(setConnectionStatus('disconnected'))
    this.isConnecting = false
    this.reconnectAttempts = 0
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
  }

  // Game actions
  joinTable(tableId: string, position?: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('player:join-table', { tableId, position })
    } else {
      this.handleConnectionError(new Error('Not connected to server'))
    }
  }

  leaveTable(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('player:leave-table')
    } else {
      this.handleConnectionError(new Error('Not connected to server'))
    }
  }

  performAction(action: PlayerAction): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:action', { action })
    } else {
      this.handleConnectionError(new Error('Not connected to server'))
    }
  }

  setReady(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('game:ready')
    }
  }

  reconnectToTable(reconnectToken: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('player:reconnect', { reconnectToken })
    }
  }

  // Chat actions
  sendChatMessage(message: string, type: 'chat' | 'emote' = 'chat'): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat:message', { message, type })
    } else {
      this.handleConnectionError(new Error('Not connected to server'))
    }
  }

  // Connection health
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.lastPingTime = Date.now()
        this.socket.emit('ping')
      }
    }, 30000) // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Event listeners setup
  private setupEventListeners(): void {
    // Listen for auth token changes
    let currentToken = store.getState().auth.token
    store.subscribe(() => {
      const newToken = store.getState().auth.token
      if (newToken !== currentToken) {
        currentToken = newToken
        if (this.socket) {
          this.socket.auth = { token: newToken }
          if (newToken && !this.socket.connected) {
            this.socket.connect()
          } else if (!newToken && this.socket.connected) {
            this.disconnect()
          }
        }
      }
    })
  }

  private setupSocketEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('disconnect', (reason) => {
      store.dispatch(setConnectionStatus('disconnected'))
      this.stopHeartbeat()
      
      store.dispatch(addNotification({
        type: 'warning',
        title: 'Disconnected',
        message: `Connection lost: ${reason}`,
        duration: 5000,
      }))

      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        setTimeout(() => this.attemptReconnect(), 2000)
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      store.dispatch(setConnectionStatus('connected'))
      this.startHeartbeat()
      
      store.dispatch(addNotification({
        type: 'success',
        title: 'Reconnected',
        message: `Reconnected after ${attemptNumber} attempts`,
        duration: 3000,
      }))
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      store.dispatch(setConnectionStatus('reconnecting'))
      
      if (attemptNumber === 1) {
        store.dispatch(addNotification({
          type: 'info',
          title: 'Reconnecting',
          message: 'Attempting to reconnect...',
        }))
      }
    })

    this.socket.on('reconnect_failed', () => {
      store.dispatch(setConnectionStatus('disconnected'))
      
      store.dispatch(addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to reconnect to server',
        duration: 10000,
      }))
    })

    // Server messages
    this.socket.on('notification', (data) => {
      store.dispatch(addNotification({
        type: data.type as any,
        title: 'Server Message',
        message: data.message,
        duration: 5000,
      }))
    })

    this.socket.on('error', (data) => {
      console.error('Socket error:', data)
      store.dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: data.message,
        duration: 7000,
      }))
    })

    // Table events
    this.socket.on('table:updated', (data) => {
      store.dispatch(updateTable(data.table))
      store.dispatch(updateLobbyTable(data.table))
    })

    this.socket.on('table:player-joined', (data) => {
      store.dispatch(playerJoined(data.player))
      store.dispatch(playerJoinedTable({ player: data.player, position: data.player.position }))
      
      store.dispatch(addSystemMessage({
        message: `${data.player.name} joined the table`,
        type: 'info',
      }))
    })

    this.socket.on('table:player-left', (data) => {
      store.dispatch(playerLeft(data.playerId))
      store.dispatch(playerLeftTable(data.playerId))
      
      store.dispatch(addSystemMessage({
        message: `Player left the table`,
        type: 'info',
      }))
    })

    // Game events
    this.socket.on('game:state-update', (data) => {
      store.dispatch(updateGameState(data.gameState))
    })

    this.socket.on('game:state-sync', (data) => {
      // Full state sync for reconnection
      store.dispatch(reconnectToGame(data.fullState))
    })

    this.socket.on('game:action-result', (data) => {
      store.dispatch(processActionResult(data))
      
      if (!data.success && data.error) {
        store.dispatch(addNotification({
          type: 'error',
          title: 'Action Failed',
          message: data.error,
          duration: 5000,
        }))
      }
    })

    this.socket.on('game:started', (data) => {
      store.dispatch(updateGameState(data.gameState))
      
      store.dispatch(addNotification({
        type: 'info',
        title: 'Game Started',
        message: 'New hand has begun!',
        duration: 3000,
      }))
      
      store.dispatch(addSystemMessage({
        message: 'New hand started',
        type: 'info',
      }))
    })

    this.socket.on('game:ended', (data) => {
      store.dispatch(updateGameState(data.gameState))
      
      // Add hand to history
      const gameState = store.getState().game.gameState
      if (gameState) {
        store.dispatch(addToHandHistory({
          id: Math.random().toString(36).substr(2, 9),
          gameId: gameState.id,
          startTime: new Date(),
          endTime: new Date(),
          players: Array.from(gameState.players.values()),
          actions: [], // Would be populated with actual hand actions
          communityCards: gameState.communityCards,
          pot: gameState.pot,
          winners: data.winners,
          showdown: gameState.showdown || false,
        }))
      }
      
      const winnerNames = data.winners.length === 1 ? 'Player won' : `${data.winners.length} players won`
      store.dispatch(addNotification({
        type: 'success',
        title: 'Hand Complete',
        message: winnerNames,
        duration: 5000,
      }))
    })

    // Player events
    this.socket.on('player:reconnected', (data) => {
      store.dispatch(addSystemMessage({
        message: `Player reconnected`,
        type: 'info',
      }))
    })

    this.socket.on('player:disconnected', (data) => {
      store.dispatch(addSystemMessage({
        message: `Player disconnected (${data.timeoutRemaining}s timeout)`,
        type: 'warning',
      }))
    })

    this.socket.on('player:turn', (data) => {
      store.dispatch(addNotification({
        type: 'info',
        title: 'Your Turn',
        message: `You have ${data.timeLimit}s to act`,
        duration: data.timeLimit * 1000,
      }))
    })

    this.socket.on('player:action-timeout', (data) => {
      store.dispatch(handlePlayerTimeout(data.playerId))
      
      store.dispatch(addSystemMessage({
        message: `Player timed out and folded`,
        type: 'warning',
      }))
    })

    // Chat events
    this.socket.on('chat:message', (message) => {
      store.dispatch(addMessage(message))
    })

    // Heartbeat
    this.socket.on('pong', (data) => {
      const latency = Date.now() - this.lastPingTime
      console.log(`Server latency: ${latency}ms`)
    })

    this.socket.on('heartbeat_ack', () => {
      // Server acknowledged our heartbeat
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.socket?.connected) {
      this.reconnectAttempts++
      store.dispatch(setConnectionStatus('reconnecting'))
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect()
        }
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      store.dispatch(setConnectionStatus('disconnected'))
      store.dispatch(addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Maximum reconnection attempts reached',
        duration: 10000,
      }))
    }
  }

  private handleConnectionError(error: Error): void {
    console.error('Socket connection error:', error)
    store.dispatch(setConnectionStatus('disconnected'))
    
    store.dispatch(addNotification({
      type: 'error',
      title: 'Connection Error',
      message: error.message || 'Failed to connect to server',
      duration: 7000,
    }))
  }

  // Public getters
  get connected(): boolean {
    return this.socket?.connected || false
  }

  get connecting(): boolean {
    return this.isConnecting
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket
  }

  // Manual reconnection
  reconnect(): void {
    if (this.socket) {
      this.reconnectAttempts = 0
      this.socket.connect()
    }
  }

  // Get connection stats
  getConnectionStats(): {
    connected: boolean
    reconnectAttempts: number
    latency: number | null
  } {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      latency: this.lastPingTime ? Date.now() - this.lastPingTime : null,
    }
  }
}

// Export singleton instance
export const socketService = new SocketService()
export default socketService
=======
import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { setConnectionStatus, addNotification } from '../store/slices/uiSlice';
import { updateGameState, setMyCards, setCanAct, setValidActions } from '../store/slices/gameSlice';
import { updateTableInfo } from '../store/slices/tableSlice';

class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(token?: string) {
        if (this.socket?.connected) return;

        const url = process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'http://localhost:3002';

        this.socket = io(url, {
            auth: {
                token: token || localStorage.getItem('accessToken'),
            },
            transports: ['websocket', 'polling'],
        });

        this.setupEventHandlers();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    private setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to game server');
            store.dispatch(setConnectionStatus('connected'));
            this.reconnectAttempts = 0;

            store.dispatch(addNotification({
                type: 'success',
                title: 'Connected',
                message: 'Connected to game server',
                duration: 3000,
            }));
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from game server:', reason);
            store.dispatch(setConnectionStatus('disconnected'));

            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.reconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            store.dispatch(setConnectionStatus('error'));
            this.reconnect();
        });

        // Game events
        this.socket.on('game:state-update', (gameState) => {
            store.dispatch(updateGameState(gameState));
        });

        this.socket.on('game:cards-dealt', (data) => {
            store.dispatch(setMyCards(data.cards));
        });

        this.socket.on('game:action-required', (data) => {
            store.dispatch(setCanAct(true));
            store.dispatch(setValidActions(data.validActions));
        });

        this.socket.on('game:hand-complete', (data) => {
            store.dispatch(setCanAct(false));
            store.dispatch(setValidActions([]));

            store.dispatch(addNotification({
                type: 'info',
                title: 'Hand Complete',
                message: `Winner: ${data.winner}`,
                duration: 5000,
            }));
        });

        // Table events
        this.socket.on('table:player-joined', (data) => {
            store.dispatch(addNotification({
                type: 'info',
                title: 'Player Joined',
                message: `${data.playerName} joined the table`,
                duration: 3000,
            }));
        });

        this.socket.on('table:player-left', (data) => {
            store.dispatch(addNotification({
                type: 'info',
                title: 'Player Left',
                message: `${data.playerName} left the table`,
                duration: 3000,
            }));
        });

        this.socket.on('table:update', (tableData) => {
            store.dispatch(updateTableInfo(tableData));
        });

        // Error events
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            store.dispatch(addNotification({
                type: 'error',
                title: 'Game Error',
                message: error.message || 'An error occurred',
                duration: 5000,
            }));
        });
    }

    private reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            store.dispatch(addNotification({
                type: 'error',
                title: 'Connection Failed',
                message: 'Unable to connect to game server',
                duration: 10000,
            }));
            return;
        }

        this.reconnectAttempts++;
        store.dispatch(setConnectionStatus('connecting'));

        setTimeout(() => {
            this.connect();
        }, 1000 * this.reconnectAttempts);
    }

    // Game actions
    joinTable(tableId: string, seatNumber?: number) {
        this.socket?.emit('table:join', { tableId, seatNumber });
    }

    leaveTable(tableId: string) {
        this.socket?.emit('table:leave', { tableId });
    }

    makeAction(action: string, amount?: number) {
        this.socket?.emit('game:action', { action, amount });
    }

    // Chat
    sendMessage(message: string, tableId?: string) {
        this.socket?.emit('chat:message', { message, tableId });
    }

    // AI Analysis
    requestAnalysis(gameData: any) {
        this.socket?.emit('ai:analyze', gameData);
    }

    get connected() {
        return this.socket?.connected || false;
    }

    get id() {
        return this.socket?.id;
    }
}

export const socketService = new SocketService(); 
>>>>>>> Stashed changes
