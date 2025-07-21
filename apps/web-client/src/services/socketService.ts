import { io, Socket } from 'socket.io-client';
import { AppDispatch } from '../store';
import { updateGameState, setCanAct, setValidActions } from '../store/slices/gameSlice';

class SocketService {
    private socket: Socket | null = null;
    private dispatch: AppDispatch | null = null;

    setDispatch(dispatch: AppDispatch) {
        this.dispatch = dispatch;
    }

    connect() {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        const dedicatedServerUrl = process.env.VITE_DEDICATED_SERVER_URL || 'http://localhost:3002';

        this.socket = io(dedicatedServerUrl, {
            transports: ['websocket'],
        });

        this.setupEventListeners();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinTable(tableId: string, seatNumber?: number) {
        if (!this.socket) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('table:join', { tableId, seatNumber });
    }

    leaveTable() {
        if (!this.socket) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('table:leave');
    }

    private setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Connected to game server');
            this.dispatch?.({ type: 'ui/setConnectionStatus', payload: 'connected' });
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from game server');
            this.dispatch?.({ type: 'ui/setConnectionStatus', payload: 'disconnected' });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.dispatch?.({ type: 'ui/setConnectionStatus', payload: 'error' });
        });

        this.socket.on('game:state-update', (data) => {
            this.dispatch?.(updateGameState(data.gameState));
        });

        this.socket.on('game:action-required', (data) => {
            this.dispatch?.(setCanAct(true));
            this.dispatch?.(setValidActions(data.validActions));
        });

        this.socket.on('player:reconnected', () => {
            this.dispatch?.({
                type: 'ui/addNotification',
                payload: {
                    type: 'success',
                    title: 'Player Reconnected',
                    message: 'Player has reconnected',
                    duration: 3000,
                }
            });
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.dispatch?.({
                type: 'ui/addNotification',
                payload: {
                    type: 'error',
                    title: 'Game Error',
                    message: error.message || 'An error occurred',
                    duration: 5000,
                }
            });
        });
    }
}

export const socketService = new SocketService();