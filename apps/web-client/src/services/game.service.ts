import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import {
    GameState,
    PlayerState,
    PlayerAction,
    Card,
    HandResult,
    TableConfig
} from '@poker-game/shared';

export interface GameEvent {
    type: string;
    data: any;
    timestamp: number;
}

export interface GameConnection {
    tableId: string;
    playerId: string;
    socket: Socket;
}

class GameService {
    private connection: GameConnection | null = null;
    private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

    async connectToTable(tableId: string, playerId: string, authToken: string): Promise<boolean> {
        try {
            const socket = io(import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:3001', {
                auth: {
                    token: authToken
                },
                query: {
                    tableId,
                    playerId
                }
            });

            this.setupSocketListeners(socket);

            return new Promise((resolve) => {
                socket.on('connect', () => {
                    this.connection = { tableId, playerId, socket };
                    toast.success('Connected to game table');
                    resolve(true);
                });

                socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                    toast.error('Failed to connect to game table');
                    resolve(false);
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!this.connection) {
                        resolve(false);
                    }
                }, 10000);
            });
        } catch (error) {
            console.error('Failed to connect to game:', error);
            toast.error('Failed to connect to game table');
            return false;
        }
    }

    private setupSocketListeners(socket: Socket) {
        // Game state updates
        socket.on('gameStateUpdate', (gameState: GameState) => {
            this.emit('gameStateUpdate', gameState);
        });

        // Player actions
        socket.on('playerAction', (action: PlayerAction) => {
            this.emit('playerAction', action);
        });

        // Game events
        socket.on('gameEvent', (event: GameEvent) => {
            this.handleGameEvent(event);
        });

        // Connection events
        socket.on('disconnect', () => {
            this.connection = null;
            this.emit('disconnected', null);
            toast.error('Disconnected from game table');
        });

        socket.on('playerJoined', (player: PlayerState) => {
            this.emit('playerJoined', player);
            toast.success(`${player.name} joined the table`);
        });

        socket.on('playerLeft', (playerId: string) => {
            this.emit('playerLeft', playerId);
            toast.info('A player left the table');
        });

        // Error handling
        socket.on('error', (error: any) => {
            console.error('Game server error:', error);
            toast.error(error.message || 'Game server error');
        });
    }

    private handleGameEvent(event: GameEvent) {
        switch (event.type) {
            case 'handDealt':
                this.emit('handDealt', event.data);
                break;
            case 'communityCardsDealt':
                this.emit('communityCardsDealt', event.data);
                break;
            case 'potWon':
                this.emit('potWon', event.data);
                toast.success(`${event.data.winnerName} won ${event.data.amount} chips!`);
                break;
            case 'gameEnded':
                this.emit('gameEnded', event.data);
                break;
            case 'timeWarning':
                this.emit('timeWarning', event.data);
                toast.warning(`Time running out: ${event.data.secondsLeft}s`);
                break;
            default:
                this.emit(event.type, event.data);
        }
    }

    sendAction(action: Omit<PlayerAction, 'timestamp'>) {
        if (!this.connection) {
            toast.error('Not connected to game');
            return false;
        }

        const fullAction: PlayerAction = {
            ...action,
            timestamp: Date.now()
        };

        this.connection.socket.emit('playerAction', fullAction);
        return true;
    }

    leaveTable() {
        if (this.connection) {
            this.connection.socket.emit('leaveTable');
            this.connection.socket.disconnect();
            this.connection = null;
            this.eventListeners.clear();
        }
    }

    // Event listener management
    on(event: string, callback: (data: any) => void) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    off(event: string, callback: (data: any) => void) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private emit(event: string, data: any) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    // Utility methods
    isConnected(): boolean {
        return this.connection?.socket.connected || false;
    }

    getTableId(): string | null {
        return this.connection?.tableId || null;
    }

    getPlayerId(): string | null {
        return this.connection?.playerId || null;
    }
}

export const gameService = new GameService();
export default gameService; 