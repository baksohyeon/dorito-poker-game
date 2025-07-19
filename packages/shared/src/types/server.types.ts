import { GameState, Card } from './game.types';

export interface ServerInfo {
  id: string;
  type: 'master' | 'dedicated' | 'ai';
  status: 'online' | 'offline' | 'maintenance' | 'overloaded';
  host: string;
  port: number;
  region?: string;
  metrics: ServerMetrics;
  createdAt: Date;
  lastHeartbeat: Date;
}

export interface ServerMetrics {
  currentTables: number;
  currentPlayers: number;
  maxTables: number;
  maxPlayers: number;
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  networkLatency: number; // ms
}

export interface DedicatedServerConfig {
  serverId: string;
  machineId: number;
  maxTables: number;
  maxPlayersPerTable: number;
  masterServerUrl: string;
  redisUrl: string;
  port: number;
  host: string;
  region: string;
}
