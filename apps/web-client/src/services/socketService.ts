import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { setConnectionStatus, addNotification } from '../store/slices/uiSlice';
import { updateGameState, setMyCards, setCanAct, setValidActions } from '../store/slices/gameSlice';
import { updateTableInfo } from '../store/slices/tableSlice';

// Types matching the dedicated server events
interface ClientToServerEvents {
  'player:join-table': (data: { tableId: string; position?: number }) => void;
  'player:leave-table': () => void;
  'player:reconnect': (data: { reconnectToken: string }) => void;
  'game:action': (data: { action: any }) => void;
  'game:ready': () => void;
  'chat:message': (data: { message: string; type?: 'chat' | 'emote' }) => void;
  'heartbeat': () => void;
  'ping': () => void;
}

interface ServerToClientEvents {
  'game:state-update': (data: { gameState: any }) => void;
  'game:state-sync': (data: { fullState: any }) => void;
  'game:action-required': (data: { timeLimit: number; validActions: string[] }) => void;
  'game:action-result': (data: { action: any; success: boolean; error?: string }) => void;
  'table:player-joined': (data: { player: any }) => void;
  'table:player-left': (data: { playerId: string }) => void;
  'table:updated': (data: { table: any }) => void;
  'player:disconnected': (data: { playerId: string; timeoutRemaining: number }) => void;
  'player:reconnected': (data: { playerId: string }) => void;
  'player:chips-updated': (data: { playerId: string; chips: number }) => void;
  'chat:message': (data: { playerId: string; message: string; timestamp: number }) => void;
  'chat:system-message': (data: { message: string; type: 'info' | 'warning' | 'error' }) => void;
  'notification': (data: { type: 'info' | 'success' | 'warning' | 'error'; message: string }) => void;
  'heartbeat_ack': () => void;
  'heartbeat_request': () => void;
  'pong': (data: { timestamp: number; serverId: string }) => void;
  'error': (data: { code: string; message: string; details?: any }) => void;
}

class SocketService {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private currentTableId: string | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private eventHandlers: Map<string, Function[]> = new Map();

    async connect(token?: string): Promise<void> {
        if (this.socket?.connected) return;

        return new Promise((resolve, reject) => {
            // Try dedicated server first (port 3002), fallback to master server (port 3001)
            const dedicatedServerUrl = import.meta.env.PROD
                ? window.location.origin.replace(':3000', ':3002')
                : 'http://localhost:3002';

            this.socket = io(dedicatedServerUrl, {
                auth: {
                    token: token || localStorage.getItem('accessToken'),
                },
                transports: ['websocket', 'polling'],
                timeout: 10000,
                autoConnect: true
            });

            this.socket.on('connect', () => {
                console.log('Connected to dedicated game server');
                store.dispatch(setConnectionStatus('connected'));
                this.reconnectAttempts = 0;
                this.startHeartbeat();
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Failed to connect to dedicated server:', error);
                reject(error);
            });

            this.setupEventHandlers();
        });
    }

    disconnect() {
        if (this.currentTableId) {
            this.emit('player:leave-table', {});
        }
        
        this.stopHeartbeat();
        
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.currentTableId = null;
        store.dispatch(setConnectionStatus('disconnected'));
    }

    private setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to dedicated game server');
            store.dispatch(setConnectionStatus('connected'));
            this.reconnectAttempts = 0;
            this.startHeartbeat();

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
            this.stopHeartbeat();

            if (reason === 'io server disconnect') {
                this.reconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            store.dispatch(setConnectionStatus('error'));
            this.reconnect();
        });

        // Game state events
        this.socket.on('game:state-update', (data) => {
            store.dispatch(updateGameState(data.gameState));
            this.emit('game-state-update', data.gameState);
        });

        this.socket.on('game:state-sync', (data) => {
            store.dispatch(updateGameState(data.fullState));
            this.emit('game-state-update', data.fullState);
        });

        this.socket.on('game:action-required', (data) => {
            store.dispatch(setCanAct(true));
            store.dispatch(setValidActions(data.validActions));
            this.emit('action-required', data);
        });

        this.socket.on('game:action-result', (data) => {
            if (!data.success && data.error) {
                store.dispatch(addNotification({
                    type: 'error',
                    title: 'Action Failed',
                    message: data.error,
                    duration: 5000,
                }));
            }
        });

        // Table events
        this.socket.on('table:player-joined', (data) => {
            store.dispatch(addNotification({
                type: 'info',
                title: 'Player Joined',
                message: `Player joined the table`,
                duration: 3000,
            }));
            this.emit('player-joined', data);
        });

        this.socket.on('table:player-left', (data) => {
            store.dispatch(addNotification({
                type: 'info',
                title: 'Player Left',
                message: `Player left the table`,
                duration: 3000,
            }));
            this.emit('player-left', data);
        });

        this.socket.on('table:updated', (data) => {
            store.dispatch(updateTableInfo(data.table));
        });

        // Player events
        this.socket.on('player:disconnected', (data) => {
            store.dispatch(addNotification({
                type: 'warning',
                title: 'Player Disconnected',
                message: `Player disconnected (${Math.round(data.timeoutRemaining / 1000)}s to reconnect)`,
                duration: 5000,
            }));
        });

        this.socket.on('player:reconnected', (data) => {
            store.dispatch(addNotification({
                type: 'success',
                title: 'Player Reconnected',
                message: 'Player has reconnected',
                duration: 3000,
            }));
        });

        // Chat events
        this.socket.on('chat:message', (data) => {
            this.emit('chat-message', {
                id: `${data.playerId}-${data.timestamp}`,
                username: data.playerId, // TODO: Get actual username
                message: data.message,
                timestamp: data.timestamp
            });
        });

        this.socket.on('chat:system-message', (data) => {
            store.dispatch(addNotification({
                type: data.type,
                title: 'System',
                message: data.message,
                duration: 5000,
            }));
        });

        // Notifications
        this.socket.on('notification', (data) => {
            store.dispatch(addNotification({
                type: data.type,
                title: 'Game',
                message: data.message,
                duration: 5000,
            }));
        });

        // Heartbeat
        this.socket.on('heartbeat_request', () => {
            this.socket?.emit('heartbeat');
        });

        this.socket.on('heartbeat_ack', () => {
            // Heartbeat acknowledged
        });

        this.socket.on('pong', (data) => {
            // Handle ping response
            console.log(`Server response: ${Date.now() - data.timestamp}ms`);
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
            this.emit('table-error', error);
        });
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('heartbeat');
            }
        }, 30000); // Every 30 seconds
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
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
        }, 1000 * Math.min(this.reconnectAttempts, 5));
    }

    // Event system for TablePage to listen to events
    on(event: string, handler: Function) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
    }

    off(event: string, handler: Function) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event: string, data?: any) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }

    // Game actions using dedicated server events
    joinTable(tableId: string, seatNumber?: number, spectator = false) {
        if (!this.socket?.connected) {
            throw new Error('Not connected to game server');
        }

        this.currentTableId = tableId;
        this.socket.emit('player:join-table', { 
            tableId, 
            position: seatNumber 
        });
    }

    leaveTable() {
        if (!this.socket?.connected || !this.currentTableId) {
            return;
        }

        this.socket.emit('player:leave-table');
        this.currentTableId = null;
    }

    playerAction(action: string, amount?: number) {
        if (!this.socket?.connected) {
            throw new Error('Not connected to game server');
        }

        this.socket.emit('game:action', { 
            action: { 
                type: action, 
                amount: amount 
            } 
        });
    }

    setPlayerReady() {
        if (!this.socket?.connected) {
            throw new Error('Not connected to game server');
        }

        this.socket.emit('game:ready');
    }

    sendChatMessage(message: string, type: 'chat' | 'emote' = 'chat') {
        if (!this.socket?.connected) {
            throw new Error('Not connected to game server');
        }

        this.socket.emit('chat:message', { message, type });
    }

    // Reconnection with token
    reconnectWithToken(reconnectToken: string) {
        if (!this.socket?.connected) {
            throw new Error('Not connected to game server');
        }

        this.socket.emit('player:reconnect', { reconnectToken });
    }

    // Ping for latency testing
    ping() {
        if (!this.socket?.connected) {
            throw new Error('Not connected to game server');
        }

        this.socket.emit('ping');
    }

    get connected() {
        return this.socket?.connected || false;
    }

    get id() {
        return this.socket?.id;
    }

    get currentTable() {
        return this.currentTableId;
    }
}

export const socketService = new SocketService();