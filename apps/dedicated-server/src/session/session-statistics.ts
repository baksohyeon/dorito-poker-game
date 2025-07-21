import {
    PokerSession,
    HandRound,
    PlayerSessionStats,
    SessionStatistics,
    SessionReport,
    SessionExportData,
    PlayerSummary,
    PlayerAction
} from '@poker-game/shared';
import { ISessionStatistics } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

export class SessionStatisticsManager implements ISessionStatistics {
    private sessions: Map<string, PokerSession> = new Map();
    private handStatistics: Map<string, Map<string, any>> = new Map();

    updateHandStatistics(session: PokerSession, hand: HandRound): void {
        try {
            // Update session-level statistics
            this.updateSessionStats(session, hand);

            // Update player-level statistics
            this.updatePlayerStats(session, hand);

            // Store hand-specific statistics
            this.storeHandStats(hand);

            logger.debug(`Updated statistics for hand ${hand.id} in session ${session.id}`);
        } catch (error) {
            logger.error(`Error updating hand statistics for ${hand.id}:`, error);
        }
    }

    calculateSessionStats(sessionId: string): SessionStatistics {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const completedHands = session.handHistory.filter(h => h.status === 'complete');
        const totalHands = completedHands.length;

        if (totalHands === 0) {
            return this.createEmptyStatistics();
        }

        // Calculate average hand duration
        const totalDuration = completedHands.reduce((sum, hand) => sum + hand.duration, 0);
        const averageHandDuration = totalDuration / totalHands;

        // Calculate average pot size
        const totalPotValue = completedHands.reduce((sum, hand) => sum + hand.finalPot, 0);
        const averagePotSize = totalPotValue / totalHands;

        // Calculate players per flop
        const handsWithFlop = completedHands.filter(h => h.bettingRounds.length >= 2);
        const totalPlayersInFlop = handsWithFlop.reduce((sum, hand) => {
            const flopRound = hand.bettingRounds.find(r => r.phase === 'flop');
            return sum + (flopRound ? flopRound.playersActed.size : 0);
        }, 0);
        const playersPerFlop = handsWithFlop.length > 0 ? totalPlayersInFlop / handsWithFlop.length : 0;

        // Calculate showdown percentage
        const showdownHands = completedHands.filter(h => h.showdownReached);
        const showdownPercentage = (showdownHands.length / totalHands) * 100;

        // Find biggest pot and fastest/longest hands
        const biggestPot = Math.max(...completedHands.map(h => h.finalPot));
        const longestHand = Math.max(...completedHands.map(h => h.duration));
        const fastestHand = Math.min(...completedHands.map(h => h.duration));

        // Calculate rake collected
        const rakeCollected = completedHands.reduce((sum, hand) => sum + hand.rake, 0);

        // Calculate player turnover
        const totalPlayersJoined = session.players.size;
        const activePlayerCount = Array.from(session.players.values()).filter(p => p.isActive).length;
        const playerTurnover = totalPlayersJoined - activePlayerCount;

        const statistics: SessionStatistics = {
            totalHandsDealt: totalHands,
            averageHandDuration,
            averagePotSize,
            playersPerFlop,
            showdownPercentage,
            rakeCollected,
            biggestPot,
            longestHand,
            fastestHand,
            playerTurnover
        };

        // Update session with calculated stats
        session.statistics = statistics;
        return statistics;
    }

    getPlayerStats(sessionId: string, playerId: string): PlayerSessionStats {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const sessionPlayer = session.players.get(playerId);
        if (!sessionPlayer) {
            throw new Error(`Player not found in session: ${playerId}`);
        }

        // Calculate advanced statistics from hand history
        const playerStats = this.calculateAdvancedPlayerStats(session, playerId);

        return {
            handsPlayed: sessionPlayer.handsPlayed,
            handsWon: sessionPlayer.handsWon,
            totalProfit: sessionPlayer.profit,
            vpip: playerStats.vpip,
            pfr: playerStats.pfr,
            aggression: playerStats.aggression,
            showdownWinRate: playerStats.showdownWinRate,
            foldToBet: playerStats.foldToBet,
            foldToRaise: playerStats.foldToRaise,
            cBetFreq: playerStats.cBetFreq,
            threeBetFreq: playerStats.threeBetFreq,
            bigBlindsWon: sessionPlayer.profit / session.config.blindStructure.big
        };
    }

    generateSessionReport(sessionId: string): SessionReport {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const statistics = this.calculateSessionStats(sessionId);
        const players = Array.from(session.players.values());

        // Find biggest winner and loser
        const sortedByProfit = players.sort((a, b) => b.profit - a.profit);
        const biggestWinner = sortedByProfit[0]?.playerId || '';
        const biggestLoser = sortedByProfit[sortedByProfit.length - 1]?.playerId || '';

        const report: SessionReport = {
            sessionId,
            duration: session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime,
            totalHands: session.totalHands,
            totalPlayers: session.players.size,
            biggestWinner,
            biggestLoser,
            biggestPot: statistics.biggestPot,
            totalRake: statistics.rakeCollected,
            averageHandDuration: statistics.averageHandDuration,
            playersPerFlop: statistics.playersPerFlop,
            showdownRate: statistics.showdownPercentage
        };

        logger.info(`Generated session report for ${sessionId}: ${report.totalHands} hands, ${report.totalPlayers} players`);
        return report;
    }

    exportSessionData(sessionId: string): SessionExportData {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const statistics = this.calculateSessionStats(sessionId);
        const playerSummaries = this.generatePlayerSummaries(session);

        const exportData: SessionExportData = {
            session: { ...session },
            hands: [...session.handHistory],
            playerSummaries,
            statistics,
            exportedAt: Date.now(),
            format: 'json'
        };

        logger.info(`Exported session data for ${sessionId}: ${exportData.hands.length} hands`);
        return exportData;
    }

    // Additional utility methods

    trackPlayerAction(sessionId: string, playerId: string, action: PlayerAction, handId: string): void {
        // Track individual player actions for detailed statistics
        const sessionStats = this.handStatistics.get(sessionId);
        if (sessionStats) {
            const playerKey = `${playerId}_${handId}`;
            if (!sessionStats.has(playerKey)) {
                sessionStats.set(playerKey, {
                    playerId,
                    handId,
                    actions: [],
                    preflopActions: [],
                    postflopActions: [],
                    sawFlop: false,
                    wentToShowdown: false,
                    wonAtShowdown: false
                });
            }

            const playerHandStats = sessionStats.get(playerKey);
            playerHandStats.actions.push(action);

            if (action.type !== 'fold') {
                if (this.isPreflop(action)) {
                    playerHandStats.preflopActions.push(action);
                } else {
                    playerHandStats.postflopActions.push(action);
                    playerHandStats.sawFlop = true;
                }
            }
        }
    }

    getHandHistoryForPlayer(sessionId: string, playerId: string, limit?: number): HandRound[] {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return [];
        }

        const playerHands = session.handHistory
            .filter(hand => hand.participants.includes(playerId))
            .sort((a, b) => b.startTime - a.startTime);

        return limit ? playerHands.slice(0, limit) : playerHands;
    }

    getSessionTrends(sessionId: string): any {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }

        const hands = session.handHistory.filter(h => h.status === 'complete');
        const trendData: {
            potSizeTrend: Array<{ handNumber: number; value: number }>;
            handDurationTrend: Array<{ handNumber: number; value: number }>;
            playerCountTrend: Array<{ handNumber: number; value: number }>;
            aggressionTrend: Array<{ handNumber: number; value: number }>;
        } = {
            potSizeTrend: [],
            handDurationTrend: [],
            playerCountTrend: [],
            aggressionTrend: []
        };

        // Calculate trends over time
        for (let i = 0; i < hands.length; i++) {
            const hand = hands[i];
            trendData.potSizeTrend.push({ handNumber: i + 1, value: hand.finalPot });
            trendData.handDurationTrend.push({ handNumber: i + 1, value: hand.duration });
            trendData.playerCountTrend.push({ handNumber: i + 1, value: hand.participants.length });

            // Calculate aggression for this hand
            const aggressiveActions = hand.actionSequence.filter(a =>
                ['bet', 'raise', 'all-in'].includes(a.type)
            ).length;
            const totalActions = hand.actionSequence.length;
            const aggressionRate = totalActions > 0 ? (aggressiveActions / totalActions) * 100 : 0;
            trendData.aggressionTrend.push({ handNumber: i + 1, value: aggressionRate });
        }

        return trendData;
    }

    private updateSessionStats(session: PokerSession, hand: HandRound): void {
        session.totalHands++;
        session.totalPot += hand.finalPot;
        session.totalRake += hand.rake;

        // Update session statistics
        const stats = session.statistics;
        stats.totalHandsDealt++;
        stats.rakeCollected += hand.rake;

        if (hand.finalPot > stats.biggestPot) {
            stats.biggestPot = hand.finalPot;
        }

        if (hand.duration > stats.longestHand) {
            stats.longestHand = hand.duration;
        }

        if (hand.duration < stats.fastestHand) {
            stats.fastestHand = hand.duration;
        }
    }

    private updatePlayerStats(session: PokerSession, hand: HandRound): void {
        for (const participantId of hand.participants) {
            const sessionPlayer = session.players.get(participantId);
            if (sessionPlayer) {
                sessionPlayer.handsPlayed++;

                // Check if player won this hand
                const winner = hand.winners.find(w => w.playerId === participantId);
                if (winner) {
                    sessionPlayer.handsWon++;
                    sessionPlayer.profit += winner.winAmount;
                    sessionPlayer.currentStack += winner.winAmount;
                }
            }
        }
    }

    private storeHandStats(hand: HandRound): void {
        const sessionStats = this.handStatistics.get(hand.sessionId);
        if (!sessionStats) {
            this.handStatistics.set(hand.sessionId, new Map());
        }

        // Store comprehensive hand statistics
        const handStats = {
            handId: hand.id,
            duration: hand.duration,
            potSize: hand.finalPot,
            playerCount: hand.participants.length,
            showdownReached: hand.showdownReached,
            totalActions: hand.actionSequence.length,
            bettingRounds: hand.bettingRounds.length,
            rake: hand.rake
        };

        this.handStatistics.get(hand.sessionId)!.set(hand.id, handStats);
    }

    private calculateAdvancedPlayerStats(session: PokerSession, playerId: string): any {
        const playerHands = session.handHistory.filter(h => h.participants.includes(playerId));
        const stats = {
            vpip: 0,
            pfr: 0,
            aggression: 0,
            showdownWinRate: 0,
            foldToBet: 0,
            foldToRaise: 0,
            cBetFreq: 0,
            threeBetFreq: 0
        };

        if (playerHands.length === 0) {
            return stats;
        }

        let voluntaryActions = 0;
        let aggressivePreflop = 0;
        let totalAggressive = 0;
        let totalPassive = 0;
        let showdowns = 0;
        let showdownWins = 0;

        for (const hand of playerHands) {
            const playerActions = hand.actionSequence.filter(a => a.playerId === playerId);
            const preflopActions = playerActions.filter(a => this.isPreflop(a));

            // VPIP calculation
            const voluntaryPreflopAction = preflopActions.find(a =>
                ['call', 'bet', 'raise', 'all-in'].includes(a.type)
            );
            if (voluntaryPreflopAction) {
                voluntaryActions++;
            }

            // PFR calculation
            const aggressivePreflopAction = preflopActions.find(a =>
                ['bet', 'raise', 'all-in'].includes(a.type)
            );
            if (aggressivePreflopAction) {
                aggressivePreflop++;
            }

            // Aggression calculation
            const aggressiveActions = playerActions.filter(a =>
                ['bet', 'raise', 'all-in'].includes(a.type)
            ).length;
            const passiveActions = playerActions.filter(a =>
                ['call', 'check'].includes(a.type)
            ).length;

            totalAggressive += aggressiveActions;
            totalPassive += passiveActions;

            // Showdown stats
            if (hand.showdownReached && hand.participants.includes(playerId)) {
                showdowns++;
                const winner = hand.winners.find(w => w.playerId === playerId);
                if (winner) {
                    showdownWins++;
                }
            }
        }

        // Calculate percentages
        stats.vpip = (voluntaryActions / playerHands.length) * 100;
        stats.pfr = (aggressivePreflop / playerHands.length) * 100;
        stats.aggression = totalPassive > 0 ? (totalAggressive / totalPassive) : 0;
        stats.showdownWinRate = showdowns > 0 ? (showdownWins / showdowns) * 100 : 0;

        return stats;
    }

    private generatePlayerSummaries(session: PokerSession): PlayerSummary[] {
        return Array.from(session.players.values()).map(player => {
            const playerStats = this.getPlayerStats(session.id, player.playerId);
            const sessionDuration = player.leftAt ? player.leftAt - player.joinedAt : Date.now() - player.joinedAt;

            return {
                playerId: player.playerId,
                playerName: `Player ${player.playerId}`, // Would come from user service
                buyIn: player.buyInAmount,
                cashOut: player.currentStack,
                profit: player.profit,
                handsPlayed: player.handsPlayed,
                handsWon: player.handsWon,
                vpip: playerStats.vpip,
                pfr: playerStats.pfr,
                aggression: playerStats.aggression,
                sessionDuration
            };
        });
    }

    private createEmptyStatistics(): SessionStatistics {
        return {
            totalHandsDealt: 0,
            averageHandDuration: 0,
            averagePotSize: 0,
            playersPerFlop: 0,
            showdownPercentage: 0,
            rakeCollected: 0,
            biggestPot: 0,
            longestHand: 0,
            fastestHand: 0,
            playerTurnover: 0
        };
    }

    private isPreflop(action: PlayerAction): boolean {
        // This would need to be enhanced to properly track phase
        // For now, assume first few actions are preflop
        return true; // Simplified for now
    }

    // Session management helpers
    registerSession(session: PokerSession): void {
        this.sessions.set(session.id, session);
        this.handStatistics.set(session.id, new Map());
    }

    unregisterSession(sessionId: string): void {
        this.sessions.delete(sessionId);
        this.handStatistics.delete(sessionId);
    }
}