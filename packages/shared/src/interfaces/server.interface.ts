import { ServerInfo, ServerMetrics, DedicatedServerConfig, TableConfig, PlayerAction } from "packages/shared/src/types";

export interface IMasterServer {
    registerDedicatedServer(serverInfo: ServerInfo): Promise<boolean>;
    unregisterDedicatedServer(serverId: string): Promise<void>;
    findBestServer(criteria?: ServerSelectionCriteria): Promise<ServerInfo | null>;
    updateServerMetrics(serverId: string, metrics: ServerMetrics): Promise<void>;
    getAllServers(): Promise<ServerInfo[]>;
    routePlayerToServer(playerId: string, tableId?: string): Promise<string>;
}

export interface IDedicatedServer {
    initialize(config: DedicatedServerConfig): Promise<void>;
    createTable(config: TableConfig): Promise<string>;
    handlePlayerConnection(playerId: string, socket: any): Promise<void>;
    handlePlayerDisconnection(playerId: string): Promise<void>;
    processGameAction(action: PlayerAction): Promise<void>;
    getServerMetrics(): ServerMetrics;
    shutdown(): Promise<void>;
}

export interface ServerSelectionCriteria {
    maxPlayers?: number;
    minAvailableTables?: number;
    region?: string;
    maxLatency?: number;
}