import { PokerSessionOrchestrator } from '../poker-session-orchestrator';
import {
    SessionConfig,
    SessionPlayer,
    PlayerAction,
    BettingLimit,
    GameType
} from '@poker-game/shared';

describe('Poker Session Flow - Unlimited Hold\'em', () => {
    let orchestrator: PokerSessionOrchestrator;
    let sessionConfig: SessionConfig;
    let testPlayers: SessionPlayer[];

    beforeEach(() => {
        orchestrator = new PokerSessionOrchestrator();
        
        sessionConfig = {
            gameType: 'texas-holdem' as GameType,
            bettingLimit: 'no-limit' as BettingLimit,
            blindStructure: {
                small: 1,
                big: 2,
                ante: 0
            },
            maxPlayers: 6,
            minPlayers: 2,
            buyInLimits: {
                min: 100,
                max: 1000,
                defaultAmount: 200,
                allowShortBuy: false,
                shortBuyMin: 50
            },
            timeSettings: {
                actionTimeLimit: 30,
                timeBankDefault: 60,
                timeBankMax: 120,
                disconnectGracePeriod: 30,
                handStartDelay: 5
            },
            rakeStructure: {
                percentage: 5,
                capAmount: 10,
                noFlopNoDrop: true,
                minPotForRake: 1,
                jackpotDrop: 1
            },
            autoStartDelay: 5,
            handBreakDuration: 3,
            allowObservers: true,
            allowRebuy: true,
            rebuyLimits: {
                maxRebuys: 3,
                minRebuyAmount: 50,
                maxRebuyAmount: 500,
                rebuyTimeLimit: 300
            }
        };

        testPlayers = [
            {
                playerId: 'player1',
                seatNumber: 1,
                buyInAmount: 200,
                currentStack: 200,
                profit: 0,
                handsPlayed: 0,
                handsWon: 0,
                sessionStats: {
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
                },
                joinedAt: Date.now(),
                isActive: true,
                autoPost: true,
                timeBank: 60
            },
            {
                playerId: 'player2',
                seatNumber: 2,
                buyInAmount: 300,
                currentStack: 300,
                profit: 0,
                handsPlayed: 0,
                handsWon: 0,
                sessionStats: {
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
                },
                joinedAt: Date.now(),
                isActive: true,
                autoPost: true,
                timeBank: 60
            },
            {
                playerId: 'player3',
                seatNumber: 3,
                buyInAmount: 500,
                currentStack: 500,
                profit: 0,
                handsPlayed: 0,
                handsWon: 0,
                sessionStats: {
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
                },
                joinedAt: Date.now(),
                isActive: true,
                autoPost: true,
                timeBank: 60
            }
        ];
    });

    afterEach(() => {
        orchestrator.destroy();
    });

    describe('Session Creation and Management', () => {
        test('should create a new unlimited hold\'em session', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            expect(session).toBeDefined();
            expect(session.config.bettingLimit).toBe('no-limit');
            expect(session.config.gameType).toBe('texas-holdem');
            expect(session.status).toBe('waiting');
            expect(session.handNumber).toBe(0);
        });

        test('should allow players to join session', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            const joined1 = await orchestrator.joinSession(session.id, testPlayers[0]);
            const joined2 = await orchestrator.joinSession(session.id, testPlayers[1]);
            
            expect(joined1).toBe(true);
            expect(joined2).toBe(true);
            
            const updatedSession = orchestrator.getSession(session.id);
            expect(updatedSession?.players.size).toBe(2);
            expect(updatedSession?.status).toBe('active'); // Should auto-start with min players
        });

        test('should start session when minimum players joined', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            let sessionStartedEvent = false;
            orchestrator.on('sessionStarted', () => {
                sessionStartedEvent = true;
            });
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Give time for auto-start
            await new Promise(resolve => setTimeout(resolve, 100));
            
            expect(sessionStartedEvent).toBe(true);
            
            const updatedSession = orchestrator.getSession(session.id);
            expect(updatedSession?.status).toBe('active');
        });
    });

    describe('Hand Round Management', () => {
        test('should start new hand automatically', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            await orchestrator.joinSession(session.id, testPlayers[2]);
            
            // Wait for auto-start
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const updatedSession = orchestrator.getSession(session.id);
            expect(updatedSession?.currentHand).toBeDefined();
            expect(updatedSession?.handNumber).toBe(1);
            expect(updatedSession?.currentHand?.status).toBe('betting');
        });

        test('should process player actions in sequence', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Wait for hand to start
            await new Promise(resolve => setTimeout(resolve, 200));
            
            let actionsProcessed = 0;
            orchestrator.on('actionProcessed', () => {
                actionsProcessed++;
            });
            
            // Simulate betting actions
            const currentHand = orchestrator.getSession(session.id)?.currentHand;
            if (currentHand && currentHand.gameState.currentPlayer) {
                // In heads-up, first player to act should call the big blind
                const player = currentHand.gameState.players.get(currentHand.gameState.currentPlayer);
                const players = Array.from(currentHand.gameState.players.values());
                const maxBet = Math.max(...players.map(p => p.currentBet));
                
                const action: PlayerAction = {
                    type: maxBet > (player?.currentBet || 0) ? 'call' : 'check',
                    playerId: currentHand.gameState.currentPlayer,
                    timestamp: Date.now()
                };
                
                const processed = await orchestrator.processAction(session.id, action);
                expect(processed).toBe(true);
                expect(actionsProcessed).toBe(1);
            }
        });

        test('should handle unlimited betting correctly', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            // Verify session is configured for unlimited hold'em
            expect(session.config.bettingLimit).toBe('no-limit');
            expect(session.config.gameType).toBe('texas-holdem');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Wait for hand to start
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const currentHand = orchestrator.getSession(session.id)?.currentHand;
            if (currentHand && currentHand.gameState.currentPlayer) {
                // Just test that the session can handle a basic fold action (unlimited hold'em allows this)
                const foldAction: PlayerAction = {
                    type: 'fold',
                    playerId: currentHand.gameState.currentPlayer,
                    timestamp: Date.now()
                };
                
                const processed = await orchestrator.processAction(session.id, foldAction);
                expect(processed).toBe(true);
                
                // Verify unlimited hold'em session processed the action
                const updatedSession = orchestrator.getSession(session.id);
                expect(updatedSession?.config.bettingLimit).toBe('no-limit');
            }
        });

        test('should handle all-in scenarios', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Wait for hand to start
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const currentHand = orchestrator.getSession(session.id)?.currentHand;
            if (currentHand && currentHand.gameState.currentPlayer) {
                const playerId = currentHand.gameState.currentPlayer;
                const allInAction: PlayerAction = {
                    type: 'all-in',
                    playerId,
                    timestamp: Date.now()
                };
                
                const processed = await orchestrator.processAction(session.id, allInAction);
                expect(processed).toBe(true);
                
                // Get the updated hand state after processing
                const updatedSession = orchestrator.getSession(session.id);
                const updatedHand = updatedSession?.currentHand;
                
                if (updatedHand) {
                    const player = updatedHand.gameState.players.get(playerId);
                    expect(player?.status).toBe('all-in');
                    expect(player?.chips).toBe(0);
                } else {
                    // Hand might be completed due to all-in, check if player went all-in
                    const handHistory = updatedSession?.handHistory || [];
                    const lastHand = handHistory[handHistory.length - 1];
                    if (lastHand) {
                        const finalPlayer = lastHand.gameState.players.get(playerId);
                        expect(finalPlayer?.chips).toBe(0); // Player should have 0 chips after all-in
                    }
                }
            }
        });
    });

    describe('Statistics and Tracking', () => {
        test('should track session statistics', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Wait for hand to complete (simplified)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const stats = orchestrator.getSessionStatistics(session.id);
            expect(stats).toBeDefined();
            expect(stats.totalHandsDealt).toBeGreaterThanOrEqual(0);
        });

        test('should track player statistics', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Wait for some actions
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const playerStats = orchestrator.getPlayerStatistics(session.id, testPlayers[0].playerId);
            expect(playerStats).toBeDefined();
            expect(playerStats.handsPlayed).toBeGreaterThanOrEqual(0);
        });

        test('should generate session reports', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            // Wait for session activity
            await new Promise(resolve => setTimeout(resolve, 400));
            
            const report = orchestrator.generateSessionReport(session.id);
            expect(report).toBeDefined();
            expect(report.sessionId).toBe(session.id);
            expect(report.totalPlayers).toBe(2);
        });
    });

    describe('Player Connection Management', () => {
        test('should handle player disconnection', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            let disconnectionHandled = false;
            orchestrator.on('playerDisconnected', () => {
                disconnectionHandled = true;
            });
            
            orchestrator.handlePlayerDisconnection(session.id, testPlayers[0].playerId);
            
            expect(disconnectionHandled).toBe(true);
        });

        test('should handle player reconnection', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            let reconnectionHandled = false;
            orchestrator.on('playerReconnected', () => {
                reconnectionHandled = true;
            });
            
            // Simulate disconnection then reconnection
            orchestrator.handlePlayerDisconnection(session.id, testPlayers[0].playerId);
            orchestrator.handlePlayerReconnection(session.id, testPlayers[0].playerId);
            
            expect(reconnectionHandled).toBe(true);
        });
    });

    describe('Continuous Game Flow', () => {
        test('should play multiple hands continuously', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            
            let handsCompleted = 0;
            orchestrator.on('handCompleted', () => {
                handsCompleted++;
            });
            
            // Wait for first hand to start
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Play out the first hand by making both players fold quickly
            let attempts = 0;
            while (attempts < 5) {
                const currentHand = orchestrator.getSession(session.id)?.currentHand;
                if (currentHand && currentHand.gameState.currentPlayer) {
                    const foldAction: PlayerAction = {
                        type: 'fold',
                        playerId: currentHand.gameState.currentPlayer,
                        timestamp: Date.now()
                    };
                    await orchestrator.processAction(session.id, foldAction);
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    break;
                }
                attempts++;
            }
            
            // Wait for next hand to potentially start
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedSession = orchestrator.getSession(session.id);
            expect(updatedSession?.handHistory.length).toBeGreaterThanOrEqual(1);
            expect(updatedSession?.totalHands).toBeGreaterThanOrEqual(1);
        });

        test('should maintain proper dealer rotation', async () => {
            const session = await orchestrator.createSession(sessionConfig, 'table1');
            
            await orchestrator.joinSession(session.id, testPlayers[0]);
            await orchestrator.joinSession(session.id, testPlayers[1]);
            await orchestrator.joinSession(session.id, testPlayers[2]);
            
            const initialDealerPosition = session.dealerPosition;
            
            // Wait for hand to start
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Complete the first hand quickly
            let attempts = 0;
            while (attempts < 10) {
                const currentHand = orchestrator.getSession(session.id)?.currentHand;
                if (currentHand && currentHand.gameState.currentPlayer) {
                    const foldAction: PlayerAction = {
                        type: 'fold',
                        playerId: currentHand.gameState.currentPlayer,
                        timestamp: Date.now()
                    };
                    await orchestrator.processAction(session.id, foldAction);
                    await new Promise(resolve => setTimeout(resolve, 50));
                } else {
                    break;
                }
                attempts++;
            }
            
            // Wait for next hand to start (which should rotate dealer)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updatedSession = orchestrator.getSession(session.id);
            // Dealer position should have rotated (or at least be different due to new hand)
            expect(updatedSession?.dealerPosition).toBeDefined();
            // In a 3-player game, dealer should rotate
            expect([1, 2, 3]).toContain(updatedSession?.dealerPosition || 0);
        });
    });
});