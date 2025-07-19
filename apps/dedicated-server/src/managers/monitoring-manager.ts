// apps/dedicated-server/src/managers/monitoring-manager.ts
import { logger } from '@poker-game/logger';
import { EventEmitter } from 'events';

interface PerformanceMetrics {
    timestamp: number;
    cpuUsage: number;
    memoryUsage: number;
    heapUsed: number;
    heapTotal: number;
    activeConnections: number;
    activeTables: number;
    activeGames: number;
    averageResponseTime: number;
    requestsPerSecond: number;
    errorsPerSecond: number;
}

interface GameMetrics {
    totalGamesPlayed: number;
    averageGameDuration: number;
    totalHandsDealt: number;
    totalPotAwarded: number;
    averagePlayersPerGame: number;
    gamesByPhase: Record<string, number>;
}

interface AlertConfig {
    name: string;
    condition: (metrics: PerformanceMetrics) => boolean;
    threshold: number;
    cooldown: number;
    lastTriggered: number;
}

export class MonitoringManager extends EventEmitter {
    private performanceHistory: PerformanceMetrics[] = [];
    private gameMetrics: GameMetrics = {
        totalGamesPlayed: 0,
        averageGameDuration: 0,
        totalHandsDealt: 0,
        totalPotAwarded: 0,
        averagePlayersPerGame: 0,
        gamesByPhase: {}
    };

    private requestTimes: number[] = [];
    private errorCounts: { timestamp: number; count: number }[] = [];
    private alerts: AlertConfig[] = [];
    private isMonitoring = false;
    private monitoringInterval: NodeJS.Timeout | null = null;

    // Configuration
    private readonly HISTORY_RETENTION = 1000; // Keep last 1000 data points
    private readonly MONITORING_INTERVAL = 5000; // 5 seconds
    private readonly RESPONSE_TIME_WINDOW = 60000; // 1 minute
    private readonly ERROR_COUNT_WINDOW = 60000; // 1 minute

    constructor() {
        super();
        this.setupDefaultAlerts();
    }

    startMonitoring(): void {
        if (this.isMonitoring) {
            return;
        }

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, this.MONITORING_INTERVAL);

        logger.info('Performance monitoring started');
    }

    stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        logger.info('Performance monitoring stopped');
    }

    recordRequestTime(startTime: number): void {
        const responseTime = Date.now() - startTime;
        this.requestTimes.push(responseTime);
        
        // Keep only recent request times
        const cutoff = Date.now() - this.RESPONSE_TIME_WINDOW;
        this.requestTimes = this.requestTimes.filter((_, index) => {
            return Date.now() - (this.RESPONSE_TIME_WINDOW - responseTime) > cutoff;
        });
    }

    recordError(): void {
        const now = Date.now();
        this.errorCounts.push({ timestamp: now, count: 1 });
        
        // Clean up old error counts
        const cutoff = now - this.ERROR_COUNT_WINDOW;
        this.errorCounts = this.errorCounts.filter(e => e.timestamp > cutoff);
    }

    recordGameStart(gameId: string, playerCount: number): void {
        this.gameMetrics.totalGamesPlayed++;
        this.gameMetrics.averagePlayersPerGame = 
            (this.gameMetrics.averagePlayersPerGame * (this.gameMetrics.totalGamesPlayed - 1) + playerCount) 
            / this.gameMetrics.totalGamesPlayed;
        
        logger.debug(`Game started: ${gameId} with ${playerCount} players`);
    }

    recordGameEnd(gameId: string, duration: number, handsDealt: number, potAwarded: number): void {
        this.gameMetrics.averageGameDuration = 
            (this.gameMetrics.averageGameDuration * (this.gameMetrics.totalGamesPlayed - 1) + duration) 
            / this.gameMetrics.totalGamesPlayed;
        
        this.gameMetrics.totalHandsDealt += handsDealt;
        this.gameMetrics.totalPotAwarded += potAwarded;
        
        logger.debug(`Game ended: ${gameId}, duration: ${duration}ms, hands: ${handsDealt}, pot: ${potAwarded}`);
    }

    recordGamePhase(phase: string): void {
        this.gameMetrics.gamesByPhase[phase] = (this.gameMetrics.gamesByPhase[phase] || 0) + 1;
    }

    addAlert(alert: AlertConfig): void {
        this.alerts.push(alert);
        logger.info(`Alert added: ${alert.name} with threshold ${alert.threshold}`);
    }

    removeAlert(name: string): void {
        this.alerts = this.alerts.filter(alert => alert.name !== name);
        logger.info(`Alert removed: ${name}`);
    }

    getCurrentMetrics(): PerformanceMetrics {
        return this.collectMetrics();
    }

    getGameMetrics(): GameMetrics {
        return { ...this.gameMetrics };
    }

    getPerformanceHistory(minutes: number = 60): PerformanceMetrics[] {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return this.performanceHistory.filter(m => m.timestamp > cutoff);
    }

    getHealthStatus(): {
        status: 'healthy' | 'warning' | 'critical';
        issues: string[];
        uptime: number;
        lastCheck: number;
    } {
        const currentMetrics = this.getCurrentMetrics();
        const issues: string[] = [];
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';

        // Check various health indicators
        if (currentMetrics.memoryUsage > 85) {
            issues.push('High memory usage');
            status = currentMetrics.memoryUsage > 95 ? 'critical' : 'warning';
        }

        if (currentMetrics.cpuUsage > 80) {
            issues.push('High CPU usage');
            status = currentMetrics.cpuUsage > 95 ? 'critical' : 'warning';
        }

        if (currentMetrics.averageResponseTime > 1000) {
            issues.push('High response times');
            status = currentMetrics.averageResponseTime > 5000 ? 'critical' : 'warning';
        }

        if (currentMetrics.errorsPerSecond > 5) {
            issues.push('High error rate');
            status = 'critical';
        }

        return {
            status,
            issues,
            uptime: process.uptime(),
            lastCheck: Date.now()
        };
    }

    private collectMetrics(): PerformanceMetrics {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        // Calculate CPU percentage (simplified)
        const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 / process.uptime() * 100;
        
        // Calculate average response time
        const avgResponseTime = this.requestTimes.length > 0 
            ? this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length 
            : 0;
        
        // Calculate requests per second
        const requestsPerSecond = this.requestTimes.length / (this.RESPONSE_TIME_WINDOW / 1000);
        
        // Calculate errors per second
        const errorsPerSecond = this.errorCounts.length / (this.ERROR_COUNT_WINDOW / 1000);

        const metrics: PerformanceMetrics = {
            timestamp: Date.now(),
            cpuUsage: Math.min(100, Math.max(0, cpuPercent)),
            memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            activeConnections: 0, // Will be set by caller
            activeTables: 0, // Will be set by caller
            activeGames: 0, // Will be set by caller
            averageResponseTime: avgResponseTime,
            requestsPerSecond,
            errorsPerSecond
        };

        // Add to history
        this.performanceHistory.push(metrics);
        
        // Trim history if too long
        if (this.performanceHistory.length > this.HISTORY_RETENTION) {
            this.performanceHistory = this.performanceHistory.slice(-this.HISTORY_RETENTION);
        }

        // Check alerts
        this.checkAlerts(metrics);

        return metrics;
    }

    private checkAlerts(metrics: PerformanceMetrics): void {
        const now = Date.now();
        
        for (const alert of this.alerts) {
            // Check if alert is in cooldown
            if (now - alert.lastTriggered < alert.cooldown) {
                continue;
            }

            // Check if condition is met
            if (alert.condition(metrics)) {
                alert.lastTriggered = now;
                this.triggerAlert(alert, metrics);
            }
        }
    }

    private triggerAlert(alert: AlertConfig, metrics: PerformanceMetrics): void {
        const alertData = {
            alert: alert.name,
            threshold: alert.threshold,
            currentValue: this.getAlertValue(alert, metrics),
            timestamp: metrics.timestamp,
            metrics
        };

        logger.warn(`Alert triggered: ${alert.name}`, alertData);
        this.emit('alert', alertData);
    }

    private getAlertValue(alert: AlertConfig, metrics: PerformanceMetrics): number {
        // This is a simplified way to get the current value for the alert
        // In a real implementation, you'd have a more sophisticated mapping
        switch (alert.name) {
            case 'High CPU Usage':
                return metrics.cpuUsage;
            case 'High Memory Usage':
                return metrics.memoryUsage;
            case 'High Response Time':
                return metrics.averageResponseTime;
            case 'High Error Rate':
                return metrics.errorsPerSecond;
            default:
                return 0;
        }
    }

    private setupDefaultAlerts(): void {
        this.alerts = [
            {
                name: 'High CPU Usage',
                condition: (m) => m.cpuUsage > 80,
                threshold: 80,
                cooldown: 300000, // 5 minutes
                lastTriggered: 0
            },
            {
                name: 'High Memory Usage',
                condition: (m) => m.memoryUsage > 85,
                threshold: 85,
                cooldown: 300000, // 5 minutes
                lastTriggered: 0
            },
            {
                name: 'High Response Time',
                condition: (m) => m.averageResponseTime > 1000,
                threshold: 1000,
                cooldown: 180000, // 3 minutes
                lastTriggered: 0
            },
            {
                name: 'High Error Rate',
                condition: (m) => m.errorsPerSecond > 5,
                threshold: 5,
                cooldown: 120000, // 2 minutes
                lastTriggered: 0
            }
        ];
    }

    // Update metrics with external data
    updateExternalMetrics(data: {
        activeConnections?: number;
        activeTables?: number;
        activeGames?: number;
    }): void {
        if (this.performanceHistory.length > 0) {
            const latest = this.performanceHistory[this.performanceHistory.length - 1];
            if (data.activeConnections !== undefined) latest.activeConnections = data.activeConnections;
            if (data.activeTables !== undefined) latest.activeTables = data.activeTables;
            if (data.activeGames !== undefined) latest.activeGames = data.activeGames;
        }
    }

    // Export metrics for external monitoring systems
    exportMetrics(): {
        performance: PerformanceMetrics[];
        game: GameMetrics;
        health: ReturnType<MonitoringManager['getHealthStatus']>;
    } {
        return {
            performance: this.getPerformanceHistory(60), // Last hour
            game: this.getGameMetrics(),
            health: this.getHealthStatus()
        };
    }
}