
// apps/master-server/src/routes/index.ts
import { Application } from 'express';
import { authRoutes } from './auth.routes';
import { playerRoutes } from './player.routes';
import { tableRoutes } from './table.routes';
import { serverRoutes } from './server.routes';
import { matchingRoutes } from './matching.routes';

export interface ServiceDependencies {
    serverManager: any;
    playerMatchingService: any;
    authService: any;
    hashRingService: any;
}

export function setupRoutes(app: Application, services: ServiceDependencies): void {
    // API routes
    app.use('/api/auth', authRoutes(services));
    app.use('/api/players', playerRoutes(services));
    app.use('/api/tables', tableRoutes(services));
    app.use('/api/servers', serverRoutes(services));
    app.use('/api/matching', matchingRoutes(services));

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            name: 'Poker Game Master Server',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                auth: '/api/auth',
                players: '/api/players',
                tables: '/api/tables',
                servers: '/api/servers',
                matching: '/api/matching'
            }
        });
    });
}