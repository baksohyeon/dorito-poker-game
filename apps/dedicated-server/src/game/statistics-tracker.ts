import {
    PlayerAction,
    GameState,
    PlayerSessionStats,
    PlayerState
} from '@poker-game/shared';
import { IStatisticsTracker } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

interface PlayerStats {
    playerId: string;
    handsPlayed: number;
    handsWon: number;
    totalProfit: number;
    preflopActions: PlayerAction[];
    postflopActions: PlayerAction[];
    flopsSeen: number;
    showdowns: number;
    showdownWins: number;
    totalBets: number;
    totalRaises: number;
    totalCalls: number;
    totalFolds: number;
    threeBets: number;
    continuationBets: number;
    foldToBets: number;
    foldToRaises: number;
    bigBlindsWon: number;
    startingStack: number;
}

export class StatisticsTracker implements IStatisticsTracker {
    private playerStats: Map<string, PlayerStats> = new Map();
    private tableStats: Map<string, PlayerStats[]> = new Map();

    updatePlayerStats(playerId: string, action: PlayerAction, gameState: GameState): void {
        const stats = this.getOrCreatePlayerStats(playerId, gameState);
        const player = gameState.players.get(playerId);

        if (!player) {
            logger.warn(`Cannot update stats: player ${playerId} not found`);
            return;
        }

        // Update action counts
        switch (action.type) {
            case 'bet':
                stats.totalBets++;
                break;
            case 'raise':
                stats.totalRaises++;
                break;
            case 'call':
                stats.totalCalls++;
                break;
            case 'fold':
                stats.totalFolds++;
                break;
        }

        // Track preflop vs postflop actions
        if (gameState.phase === 'preflop') {
            stats.preflopActions.push(action);

            // Track 3-bets (raise after a raise preflop)
            const preflopRaises = stats.preflopActions.filter(a =>
                ['bet', 'raise'].includes(a.type)
            ).length;

            if (action.type === 'raise' && preflopRaises > 1) {
                stats.threeBets++;
            }
        } else {
            stats.postflopActions.push(action);

            // Track flops seen
            if (gameState.phase === 'flop' && stats.preflopActions.length > 0) {
                const lastPreflopAction = stats.preflopActions[stats.preflopActions.length - 1];
                if (!['fold'].includes(lastPreflopAction.type)) {
                    stats.flopsSeen++;
                }
            }
        }

        // Track fold-to-bet/raise stats
        if (action.type === 'fold') {
            const lastOpponentAction = this.getLastOpponentAction(playerId, gameState);
            if (lastOpponentAction) {
                if (lastOpponentAction.type === 'bet') {
                    stats.foldToBets++;
                } else if (lastOpponentAction.type === 'raise') {
                    stats.foldToRaises++;
                }
            }
        }

        // Update profit tracking
        const currentStack = player.chips;
        const profit = currentStack - stats.startingStack;
        stats.totalProfit = profit;
        stats.bigBlindsWon = profit / gameState.blinds.big;

        logger.debug(`Updated stats for player ${playerId}:`, {
            handsPlayed: stats.handsPlayed,
            vpip: this.calculateVPIP(playerId),
            pfr: this.calculatePFR(playerId)
        });
    }

    getPlayerStats(playerId: string): PlayerSessionStats {
        const stats = this.playerStats.get(playerId);
        if (!stats) {
            return this.createEmptySessionStats();
        }

        return {
            handsPlayed: stats.handsPlayed,
            handsWon: stats.handsWon,
            totalProfit: stats.totalProfit,
            vpip: this.calculateVPIP(playerId),
            pfr: this.calculatePFR(playerId),
            aggression: this.calculateAggression(playerId),
            showdownWinRate: stats.showdowns > 0 ? (stats.showdownWins / stats.showdowns) * 100 : 0,
            foldToBet: stats.foldToBets,
            foldToRaise: stats.foldToRaises,
            cBetFreq: this.calculateCBetFrequency(playerId),
            threeBetFreq: this.calculateThreeBetFrequency(playerId),
            bigBlindsWon: stats.bigBlindsWon
        };
    }

    calculateVPIP(playerId: string): number {
        const stats = this.playerStats.get(playerId);
        if (!stats || stats.handsPlayed === 0) return 0;

        const voluntaryActions = stats.preflopActions.filter(action =>
            ['call', 'bet', 'raise', 'all-in'].includes(action.type)
        ).length;

        return (voluntaryActions / stats.handsPlayed) * 100;
    }

    calculatePFR(playerId: string): number {
        const stats = this.playerStats.get(playerId);
        if (!stats || stats.handsPlayed === 0) return 0;

        const aggressiveActions = stats.preflopActions.filter(action =>
            ['bet', 'raise', 'all-in'].includes(action.type)
        ).length;

        return (aggressiveActions / stats.handsPlayed) * 100;
    }

    calculateAggression(playerId: string): number {
        const stats = this.playerStats.get(playerId);
        if (!stats) return 0;

        const aggressiveActions = stats.totalBets + stats.totalRaises;
        const passiveActions = stats.totalCalls;

        if (passiveActions === 0) return aggressiveActions > 0 ? 100 : 0;

        return (aggressiveActions / (aggressiveActions + passiveActions)) * 100;
    }

    resetSessionStats(playerId: string): void {
        this.playerStats.delete(playerId);
        logger.info(`Reset session stats for player ${playerId}`);
    }

    getTableAverageStats(tableId: string): PlayerSessionStats {
        const tableStats = this.tableStats.get(tableId);
        if (!tableStats || tableStats.length === 0) {
            return this.createEmptySessionStats();
        }

        const totalPlayers = tableStats.length;
        const averages = tableStats.reduce((acc, stats) => {
            const sessionStats = this.getPlayerStats(stats.playerId);
            return {
                handsPlayed: acc.handsPlayed + sessionStats.handsPlayed,
                handsWon: acc.handsWon + sessionStats.handsWon,
                totalProfit: acc.totalProfit + sessionStats.totalProfit,
                vpip: acc.vpip + sessionStats.vpip,
                pfr: acc.pfr + sessionStats.pfr,
                aggression: acc.aggression + sessionStats.aggression,
                showdownWinRate: acc.showdownWinRate + sessionStats.showdownWinRate,
                foldToBet: acc.foldToBet + sessionStats.foldToBet,
                foldToRaise: acc.foldToRaise + sessionStats.foldToRaise,
                cBetFreq: acc.cBetFreq + sessionStats.cBetFreq,
                threeBetFreq: acc.threeBetFreq + sessionStats.threeBetFreq,
                bigBlindsWon: acc.bigBlindsWon + sessionStats.bigBlindsWon
            };
        }, this.createEmptySessionStats());

        // Calculate averages
        return {
            handsPlayed: Math.round(averages.handsPlayed / totalPlayers),
            handsWon: Math.round(averages.handsWon / totalPlayers),
            totalProfit: averages.totalProfit / totalPlayers,
            vpip: averages.vpip / totalPlayers,
            pfr: averages.pfr / totalPlayers,
            aggression: averages.aggression / totalPlayers,
            showdownWinRate: averages.showdownWinRate / totalPlayers,
            foldToBet: averages.foldToBet / totalPlayers,
            foldToRaise: averages.foldToRaise / totalPlayers,
            cBetFreq: averages.cBetFreq / totalPlayers,
            threeBetFreq: averages.threeBetFreq / totalPlayers,
            bigBlindsWon: averages.bigBlindsWon / totalPlayers
        };
    }

    // Additional methods for hand completion and showdown tracking

    onHandComplete(playerId: string, won: boolean, profit: number): void {
        const stats = this.getOrCreatePlayerStats(playerId);
        stats.handsPlayed++;

        if (won) {
            stats.handsWon++;
        }

        stats.totalProfit += profit;
    }

    onShowdown(playerId: string, won: boolean): void {
        const stats = this.getOrCreatePlayerStats(playerId);
        stats.showdowns++;

        if (won) {
            stats.showdownWins++;
        }
    }

    private getOrCreatePlayerStats(playerId: string, gameState?: GameState): PlayerStats {
        let stats = this.playerStats.get(playerId);

        if (!stats) {
            const player = gameState?.players.get(playerId);
            stats = {
                playerId,
                handsPlayed: 0,
                handsWon: 0,
                totalProfit: 0,
                preflopActions: [],
                postflopActions: [],
                flopsSeen: 0,
                showdowns: 0,
                showdownWins: 0,
                totalBets: 0,
                totalRaises: 0,
                totalCalls: 0,
                totalFolds: 0,
                threeBets: 0,
                continuationBets: 0,
                foldToBets: 0,
                foldToRaises: 0,
                bigBlindsWon: 0,
                startingStack: player?.startingChips || 0
            };

            this.playerStats.set(playerId, stats);
        }

        return stats;
    }

    private calculateCBetFrequency(playerId: string): number {
        const stats = this.playerStats.get(playerId);
        if (!stats) return 0;

        // Simplified c-bet calculation - in reality this would be more complex
        const postflopBets = stats.postflopActions.filter(a => a.type === 'bet').length;
        const preflopRaises = stats.preflopActions.filter(a => a.type === 'raise').length;

        return preflopRaises > 0 ? (postflopBets / preflopRaises) * 100 : 0;
    }

    private calculateThreeBetFrequency(playerId: string): number {
        const stats = this.playerStats.get(playerId);
        if (!stats || stats.handsPlayed === 0) return 0;

        return (stats.threeBets / stats.handsPlayed) * 100;
    }

    private getLastOpponentAction(playerId: string, gameState: GameState): PlayerAction | null {
        // Find the last action that wasn't from this player
        for (let i = gameState.actionHistory.length - 1; i >= 0; i--) {
            const action = gameState.actionHistory[i];
            if (action.playerId !== playerId) {
                return action;
            }
        }
        return null;
    }

    private createEmptySessionStats(): PlayerSessionStats {
        return {
            handsPlayed: 0,
            handsWon: 0,
            totalProfit: 0,
            vpip: 0,
            pfr: 0,
            aggression: 0,
            showdownWinRate: 0,
            foldToBet: 0,
            foldToRaise: 0,
            cBetFreq: 0,
            threeBetFreq: 0,
            bigBlindsWon: 0
        };
    }
}