// packages/shared/src/types/analytics.types.ts

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: EventContext;
}

export type AnalyticsEventType =
  // User events
  | 'user_registered'
  | 'user_login'
  | 'user_logout'
  | 'user_deposit'
  | 'user_withdrawal'

  // Game events
  | 'game_joined'
  | 'game_left'
  | 'game_started'
  | 'game_ended'
  | 'hand_played'
  | 'action_taken'

  // Table events
  | 'table_created'
  | 'table_joined'
  | 'table_left'

  // Tournament events
  | 'tournament_registered'
  | 'tournament_started'
  | 'tournament_eliminated'
  | 'tournament_won'

  // Business events
  | 'purchase_made'
  | 'subscription_started'
  | 'subscription_cancelled'

  // Technical events
  | 'error_occurred'
  | 'performance_metric'
  | 'feature_used';

export interface EventContext {
  userAgent?: string;
  platform?: string;
  version?: string;
  region?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface UserMetrics {
  userId: string;
  totalSessions: number;
  totalPlayTime: number; // minutes
  averageSessionLength: number; // minutes
  gamesPlayed: number;
  winRate: number;
  totalWinnings: number;
  totalLosses: number;
  favoriteGameType: string;
  lastActivity: Date;
  retentionDays: number[];
  lifetimeValue: number;
}

export interface GameMetrics {
  gameId: string;
  tableId: string;
  duration: number; // minutes
  playersCount: number;
  handsPlayed: number;
  totalPot: number;
  averagePot: number;
  vpipPercentage: number;
  pfrPercentage: number;
  aggressionFactor: number;
  showdownPercentage: number;
}

export interface TableMetrics {
  tableId: string;
  averagePlayersCount: number;
  gamesPerHour: number;
  handsPerHour: number;
  averagePotSize: number;
  playerTurnover: number;
  profitability: number;
  popularityScore: number;
}

export interface AnalyticsServerMetrics {
  serverId: string;
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
  averageResponseTime: number;
  throughput: number;
}

export interface BusinessMetrics {
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  revenue: number;
  activeUsers: number;
  newUsers: number;
  churningUsers: number;
  retentionRate: number;
  averageSessionLength: number;
  gamesPlayed: number;
  conversionRate: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  isActive: boolean;
  notifications: AlertNotification[];
}

export interface AlertCondition {
  operator: '>' | '<' | '=' | '>=' | '<=' | '!=';
  timeWindow: number; // minutes
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

export interface AlertNotification {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  template?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number; // seconds
  isPublic: boolean;
  ownerId: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'map';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  dataSource: DataSource;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'area';
  timeRange?: string;
  refreshInterval?: number;
  showLegend?: boolean;
  colors?: string[];
  thresholds?: number[];
}

export interface DataSource {
  type: 'metrics' | 'events' | 'logs' | 'database';
  query: string;
  parameters?: Record<string, any>;
}

export interface DashboardFilter {
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'text';
  options?: string[];
  defaultValue?: any;
}
