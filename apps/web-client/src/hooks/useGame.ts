import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { gameService } from '../services/game.service';
import {
    setConnectionStatus,
    setLoading,
    setError,
    updateGameState,
    setCurrentPlayerId,
    addPlayerAction,
    handlePlayerJoined,
    handlePlayerLeft,
    handleHandDealt,
    handleCommunityCardsDealt,
    handlePotWon,
    setActionTimeRemaining,
    resetGameState
} from '../store/slices/game.slice';
import { PlayerAction } from '@poker-game/shared';

export const useGame = (tableId: string) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { isConnected, gameState, currentPlayerId, actionTimeRemaining } = useAppSelector(state => state.game);
    const actionTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Connect to game table
    const connectToTable = useCallback(async () => {
        if (!user?.id || !tableId) return false;

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const success = await gameService.connectToTable(
                tableId,
                user.id,
                user.token || ''
            );

            if (success) {
                dispatch(setConnectionStatus(true));
                dispatch(setCurrentPlayerId(user.id));
            } else {
                dispatch(setError('Failed to connect to game table'));
            }

            return success;
        } catch (error) {
            dispatch(setError('Connection error'));
            return false;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, user, tableId]);

    // Disconnect from game table
    const disconnectFromTable = useCallback(() => {
        gameService.leaveTable();
        dispatch(setConnectionStatus(false));
        dispatch(resetGameState());
    }, [dispatch]);

    // Send player action
    const sendAction = useCallback((action: Omit<PlayerAction, 'timestamp' | 'playerId'>) => {
        if (!user?.id) return false;

        const success = gameService.sendAction({
            ...action,
            playerId: user.id
        });

        if (success) {
            dispatch(addPlayerAction({
                ...action,
                playerId: user.id,
                timestamp: Date.now()
            }));
        }

        return success;
    }, [dispatch, user]);

    // Quick action methods
    const fold = useCallback(() => {
        return sendAction({ type: 'fold' });
    }, [sendAction]);

    const check = useCallback(() => {
        return sendAction({ type: 'check' });
    }, [sendAction]);

    const call = useCallback(() => {
        return sendAction({ type: 'call' });
    }, [sendAction]);

    const bet = useCallback((amount: number) => {
        return sendAction({ type: 'bet', amount });
    }, [sendAction]);

    const raise = useCallback((amount: number) => {
        return sendAction({ type: 'raise', amount });
    }, [sendAction]);

    const allIn = useCallback(() => {
        if (!gameState || !user?.id) return false;

        const player = gameState.players.get(user.id);
        if (!player) return false;

        return sendAction({ type: 'all-in', amount: player.chips });
    }, [sendAction, gameState, user]);

    // Start action timer
    const startActionTimer = useCallback((duration: number) => {
        if (actionTimerRef.current) {
            clearInterval(actionTimerRef.current);
        }

        dispatch(setActionTimeRemaining(duration));

        actionTimerRef.current = setInterval(() => {
            dispatch(setActionTimeRemaining(prev => {
                const newTime = Math.max(0, prev - 1);
                if (newTime === 0 && actionTimerRef.current) {
                    clearInterval(actionTimerRef.current);
                    actionTimerRef.current = null;
                }
                return newTime;
            }));
        }, 1000);
    }, [dispatch]);

    // Stop action timer
    const stopActionTimer = useCallback(() => {
        if (actionTimerRef.current) {
            clearInterval(actionTimerRef.current);
            actionTimerRef.current = null;
        }
        dispatch(setActionTimeRemaining(0));
    }, [dispatch]);

    // Setup game event listeners
    useEffect(() => {
        if (!isConnected) return;

        const handleGameStateUpdate = (gameState: any) => {
            dispatch(updateGameState(gameState));

            // Start timer if it's current player's turn
            if (gameState.currentPlayer === user?.id && gameState.actionStartTime) {
                const elapsed = Math.floor((Date.now() - gameState.actionStartTime) / 1000);
                const remaining = Math.max(0, gameState.actionTimeLimit - elapsed);
                startActionTimer(remaining);
            } else {
                stopActionTimer();
            }
        };

        const handlePlayerAction = (action: PlayerAction) => {
            dispatch(addPlayerAction(action));
        };

        const handlePlayerJoined = (player: any) => {
            dispatch(handlePlayerJoined(player));
        };

        const handlePlayerLeft = (playerId: string) => {
            dispatch(handlePlayerLeft(playerId));
        };

        const handleHandDealt = (data: { playerId: string; cards: any[] }) => {
            dispatch(handleHandDealt(data));
        };

        const handleCommunityCardsDealt = (cards: any[]) => {
            dispatch(handleCommunityCardsDealt(cards));
        };

        const handlePotWon = (data: any) => {
            dispatch(handlePotWon(data));
        };

        const handleDisconnected = () => {
            dispatch(setConnectionStatus(false));
            stopActionTimer();
        };

        // Register event listeners
        gameService.on('gameStateUpdate', handleGameStateUpdate);
        gameService.on('playerAction', handlePlayerAction);
        gameService.on('playerJoined', handlePlayerJoined);
        gameService.on('playerLeft', handlePlayerLeft);
        gameService.on('handDealt', handleHandDealt);
        gameService.on('communityCardsDealt', handleCommunityCardsDealt);
        gameService.on('potWon', handlePotWon);
        gameService.on('disconnected', handleDisconnected);

        // Cleanup
        return () => {
            gameService.off('gameStateUpdate', handleGameStateUpdate);
            gameService.off('playerAction', handlePlayerAction);
            gameService.off('playerJoined', handlePlayerJoined);
            gameService.off('playerLeft', handlePlayerLeft);
            gameService.off('handDealt', handleHandDealt);
            gameService.off('communityCardsDealt', handleCommunityCardsDealt);
            gameService.off('potWon', handlePotWon);
            gameService.off('disconnected', handleDisconnected);
        };
    }, [dispatch, isConnected, user, startActionTimer, stopActionTimer]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (actionTimerRef.current) {
                clearInterval(actionTimerRef.current);
            }
        };
    }, []);

    return {
        // Connection
        isConnected,
        connectToTable,
        disconnectFromTable,

        // Game state
        gameState,
        currentPlayerId,
        actionTimeRemaining,

        // Actions
        sendAction,
        fold,
        check,
        call,
        bet,
        raise,
        allIn,

        // Timer
        startActionTimer,
        stopActionTimer
    };
}; 