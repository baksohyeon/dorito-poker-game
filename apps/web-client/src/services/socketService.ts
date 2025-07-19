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

        const url = import.meta.env.PROD
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