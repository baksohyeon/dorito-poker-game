#!/usr/bin/env node

/**
 * Comprehensive Example: Unlimited Texas Hold'em Session
 * 
 * This example demonstrates the complete poker session and hand round management system
 * for unlimited hold'em with continuous play, statistics tracking, and player management.
 */

import { PokerSessionOrchestrator } from '../poker-session-orchestrator';
import {
    SessionConfig,
    SessionPlayer,
    PlayerAction,
    BettingLimit,
    GameType
} from '@poker-game/shared';

async function runUnlimitedHoldemExample() {
    console.log('🎰 Starting Unlimited Texas Hold\'em Example\n');

    // Initialize the orchestrator
    const orchestrator = new PokerSessionOrchestrator();

    // Configure the session for unlimited hold'em
    const sessionConfig: SessionConfig = {
        gameType: 'texas-holdem' as GameType,
        bettingLimit: 'no-limit' as BettingLimit,
        blindStructure: {
            small: 5,
            big: 10,
            ante: 0
        },
        maxPlayers: 6,
        minPlayers: 2,
        buyInLimits: {
            min: 500,    // 50 big blinds minimum
            max: 2000,   // 200 big blinds maximum
            defaultAmount: 1000, // 100 big blinds default
            allowShortBuy: true,
            shortBuyMin: 200 // 20 big blinds minimum for short buy
        },
        timeSettings: {
            actionTimeLimit: 30,     // 30 seconds per action
            timeBankDefault: 60,     // 60 second time bank
            timeBankMax: 120,        // Maximum 2 minutes time bank
            disconnectGracePeriod: 30, // 30 seconds to reconnect
            handStartDelay: 5        // 5 seconds between hands
        },
        rakeStructure: {
            percentage: 5,           // 5% rake
            capAmount: 15,          // $15 maximum rake
            noFlopNoDrop: true,     // No rake if hand doesn't see flop
            minPotForRake: 2,       // Minimum $2 pot for rake
            jackpotDrop: 1          // $1 jackpot drop
        },
        autoStartDelay: 10,         // Auto-start after 10 seconds with min players
        handBreakDuration: 3,       // 3 second break between hands
        allowObservers: true,
        allowRebuy: true,
        rebuyLimits: {
            maxRebuys: 3,          // Maximum 3 rebuys
            minRebuyAmount: 500,   // Minimum rebuy amount
            maxRebuyAmount: 2000,  // Maximum rebuy amount
            rebuyTimeLimit: 300    // 5 minutes to rebuy after busting
        }
    };

    // Create test players with different stack sizes
    const players: SessionPlayer[] = [
        {
            playerId: 'alice',
            seatNumber: 1,
            buyInAmount: 1000,
            currentStack: 1000,
            profit: 0,
            handsPlayed: 0,
            handsWon: 0,
            sessionStats: createEmptyStats(),
            joinedAt: Date.now(),
            isActive: true,
            autoPost: true,
            timeBank: 60
        },
        {
            playerId: 'bob',
            seatNumber: 3,
            buyInAmount: 1500,
            currentStack: 1500,
            profit: 0,
            handsPlayed: 0,
            handsWon: 0,
            sessionStats: createEmptyStats(),
            joinedAt: Date.now(),
            isActive: true,
            autoPost: true,
            timeBank: 60
        },
        {
            playerId: 'charlie',
            seatNumber: 5,
            buyInAmount: 800,
            currentStack: 800,
            profit: 0,
            handsPlayed: 0,
            handsWon: 0,
            sessionStats: createEmptyStats(),
            joinedAt: Date.now(),
            isActive: true,
            autoPost: true,
            timeBank: 60
        }
    ];

    // Set up event listeners
    setupEventListeners(orchestrator);

    try {
        // 1. Create Session
        console.log('📋 Creating unlimited hold\'em session...');
        const session = await orchestrator.createSession(sessionConfig, 'table-nlhe-001');
        console.log(`✅ Session created: ${session.id}`);
        console.log(`   Game Type: ${session.config.gameType}`);
        console.log(`   Betting Limit: ${session.config.bettingLimit}`);
        console.log(`   Blinds: $${session.config.blindStructure.small}/$${session.config.blindStructure.big}\n`);

        // 2. Add Players
        console.log('👥 Adding players to session...');
        for (const player of players) {
            const joined = await orchestrator.joinSession(session.id, player);
            if (joined) {
                console.log(`✅ ${player.playerId} joined with $${player.buyInAmount} (${player.buyInAmount / session.config.blindStructure.big}BB)`);
            }
        }
        console.log();

        // 3. Wait for automatic session start and first hand
        console.log('⏳ Waiting for session to auto-start and first hand to begin...');
        await sleep(2000);

        // 4. Simulate some hands with different betting patterns
        await simulateUnlimitedHoldemPlay(orchestrator, session.id, 5);

        // 5. Add a new player mid-session
        console.log('\n👤 Adding new player mid-session...');
        const newPlayer: SessionPlayer = {
            playerId: 'david',
            seatNumber: 2,
            buyInAmount: 2000, // Big stack player
            currentStack: 2000,
            profit: 0,
            handsPlayed: 0,
            handsWon: 0,
            sessionStats: createEmptyStats(),
            joinedAt: Date.now(),
            isActive: true,
            autoPost: true,
            timeBank: 60
        };
        
        await orchestrator.joinSession(session.id, newPlayer);
        console.log(`✅ ${newPlayer.playerId} joined with $${newPlayer.buyInAmount} (${newPlayer.buyInAmount / session.config.blindStructure.big}BB)`);

        // 6. Continue playing with the new player
        await simulateUnlimitedHoldemPlay(orchestrator, session.id, 3);

        // 7. Simulate player disconnection and reconnection
        console.log('\n🔌 Simulating player disconnection...');
        orchestrator.handlePlayerDisconnection(session.id, 'alice');
        await sleep(2000);
        
        console.log('🔌 Player reconnecting...');
        orchestrator.handlePlayerReconnection(session.id, 'alice');

        // 8. Generate and display session statistics
        console.log('\n📊 Generating Session Statistics...');
        const stats = orchestrator.getSessionStatistics(session.id);
        console.log('Session Statistics:');
        console.log(`   Total Hands Dealt: ${stats.totalHandsDealt}`);
        console.log(`   Average Hand Duration: ${(stats.averageHandDuration / 1000).toFixed(1)}s`);
        console.log(`   Average Pot Size: $${stats.averagePotSize.toFixed(2)}`);
        console.log(`   Players Per Flop: ${stats.playersPerFlop.toFixed(1)}`);
        console.log(`   Showdown Percentage: ${stats.showdownPercentage.toFixed(1)}%`);
        console.log(`   Total Rake Collected: $${stats.rakeCollected.toFixed(2)}`);
        console.log(`   Biggest Pot: $${stats.biggestPot.toFixed(2)}`);

        // 9. Display player statistics
        console.log('\n👤 Player Statistics:');
        for (const player of [...players, newPlayer]) {
            const playerStats = orchestrator.getPlayerStatistics(session.id, player.playerId);
            console.log(`   ${player.playerId}:`);
            console.log(`     Hands Played: ${playerStats.handsPlayed}`);
            console.log(`     VPIP: ${playerStats.vpip.toFixed(1)}%`);
            console.log(`     PFR: ${playerStats.pfr.toFixed(1)}%`);
            console.log(`     Profit: $${playerStats.totalProfit.toFixed(2)} (${playerStats.bigBlindsWon.toFixed(1)}BB)`);
        }

        // 10. Generate session report
        console.log('\n📋 Session Report:');
        const report = orchestrator.generateSessionReport(session.id);
        console.log(`   Session Duration: ${(report.duration / 1000 / 60).toFixed(1)} minutes`);
        console.log(`   Total Hands: ${report.totalHands}`);
        console.log(`   Total Players: ${report.totalPlayers}`);
        console.log(`   Biggest Winner: ${report.biggestWinner}`);
        console.log(`   Biggest Loser: ${report.biggestLoser}`);
        console.log(`   Total Rake: $${report.totalRake.toFixed(2)}`);

        // 11. Export session data
        console.log('\n💾 Exporting session data...');
        const exportData = orchestrator.exportSessionData(session.id);
        console.log(`✅ Exported ${exportData.hands.length} hands and ${exportData.playerSummaries.length} player summaries`);

        console.log('\n🎉 Unlimited Hold\'em session completed successfully!');

    } catch (error) {
        console.error('❌ Error during session:', error);
    } finally {
        // Cleanup
        orchestrator.destroy();
        console.log('\n🧹 Session orchestrator cleaned up');
    }
}

async function simulateUnlimitedHoldemPlay(orchestrator: PokerSessionOrchestrator, sessionId: string, handCount: number) {
    console.log(`\n🃏 Simulating ${handCount} hands of unlimited hold'em...`);
    
    for (let i = 0; i < handCount; i++) {
        console.log(`\n--- Hand ${i + 1} ---`);
        
        // Wait for hand to start
        await sleep(1000);
        
        const currentSession = orchestrator.getSession(sessionId);
        const currentHand = currentSession?.currentHand;
        
        if (currentHand && currentHand.gameState.currentPlayer) {
            // Simulate various betting patterns typical in unlimited hold'em
            const bettingPatterns = [
                'conservative', // Fold, call, small bets
                'aggressive',   // Large bets, raises
                'tricky',      // Check-raises, slow play
                'all-in'       // All-in scenarios
            ];
            
            const pattern = bettingPatterns[Math.floor(Math.random() * bettingPatterns.length)];
            console.log(`   Simulating ${pattern} betting pattern...`);
            
            await simulateBettingAction(orchestrator, sessionId, currentHand.gameState.currentPlayer, pattern);
        }
        
        // Wait for hand to complete
        await sleep(2000);
    }
}

async function simulateBettingAction(
    orchestrator: PokerSessionOrchestrator, 
    sessionId: string, 
    playerId: string, 
    pattern: string
) {
    const session = orchestrator.getSession(sessionId);
    const currentHand = session?.currentHand;
    
    if (!currentHand || !currentHand.gameState.players.has(playerId)) {
        return;
    }
    
    const player = currentHand.gameState.players.get(playerId)!;
    const bigBlind = session.config.blindStructure.big;
    
    let action: PlayerAction;
    
    switch (pattern) {
        case 'aggressive':
            // Large bets/raises (2-5x pot)
            const potSizedBet = Math.min(currentHand.gameState.pot * (2 + Math.random() * 3), player.chips);
            action = {
                type: potSizedBet > 0 && Math.random() > 0.3 ? 'bet' : 'raise',
                playerId,
                amount: Math.max(bigBlind * 3, potSizedBet),
                timestamp: Date.now()
            };
            break;
            
        case 'all-in':
            // All-in scenarios
            action = {
                type: 'all-in',
                playerId,
                timestamp: Date.now()
            };
            break;
            
        case 'tricky':
            // Mix of checks and raises
            action = {
                type: Math.random() > 0.5 ? 'check' : 'raise',
                playerId,
                amount: Math.random() > 0.5 ? bigBlind * 2.5 : undefined,
                timestamp: Date.now()
            };
            break;
            
        default: // conservative
            // Small bets, calls, folds
            const conservativeActions = ['fold', 'call', 'check'];
            action = {
                type: conservativeActions[Math.floor(Math.random() * conservativeActions.length)] as any,
                playerId,
                amount: bigBlind,
                timestamp: Date.now()
            };
            break;
    }
    
    try {
        const processed = await orchestrator.processAction(sessionId, action);
        if (processed) {
            console.log(`     ${playerId}: ${action.type}${action.amount ? ` $${action.amount}` : ''}`);
        }
    } catch (error) {
        console.log(`     ${playerId}: action failed - ${error}`);
    }
}

function setupEventListeners(orchestrator: PokerSessionOrchestrator) {
    orchestrator.on('sessionCreated', (session) => {
        console.log(`🎰 Session Created: ${session.id}`);
    });

    orchestrator.on('sessionStarted', (session) => {
        console.log(`▶️  Session Started: ${session.id} with ${session.players.size} players`);
    });

    orchestrator.on('handStarted', ({ session, hand }) => {
        console.log(`🃏 Hand #${hand.handNumber} started - Dealer: Seat ${hand.dealerPosition}`);
    });

    orchestrator.on('handCompleted', ({ session, hand }) => {
        const winners = hand.winners.map(w => `${w.playerId}($${w.winAmount})`).join(', ');
        console.log(`✅ Hand #${hand.handNumber} completed - Winners: ${winners} - Pot: $${hand.finalPot} - Rake: $${hand.rake}`);
    });

    orchestrator.on('actionProcessed', ({ sessionId, action }) => {
        console.log(`     Action: ${action.playerId} ${action.type}${action.amount ? ` $${action.amount}` : ''}`);
    });

    orchestrator.on('playerDisconnected', ({ sessionId, playerId }) => {
        console.log(`🔌 Player Disconnected: ${playerId}`);
    });

    orchestrator.on('playerReconnected', ({ sessionId, playerId }) => {
        console.log(`🔌 Player Reconnected: ${playerId}`);
    });

    orchestrator.on('actionTimeout', ({ playerId }) => {
        console.log(`⏰ Action Timeout: ${playerId} (auto-fold)`);
    });
}

function createEmptyStats() {
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

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the example if called directly
if (require.main === module) {
    runUnlimitedHoldemExample()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Example failed:', error);
            process.exit(1);
        });
}

export { runUnlimitedHoldemExample };