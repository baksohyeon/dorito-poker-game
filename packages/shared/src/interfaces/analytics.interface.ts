// packages/shared/src/interfaces/analytics.interface.ts
import {
  AnalyticsEvent,
  UserMetrics,
  GameMetrics,
  // TableMetrics,
  AnalyticsServerMetrics,
  BusinessMetrics,
  PerformanceMetric,
  AlertRule,
  Dashboard,
  DashboardWidget,
} from '../types/analytics.types';

export interface IAnalyticsService {
  // Event tracking
  trackEvent(event: Partial<AnalyticsEvent>): Promise<void>;
  trackPageView(
    userId: string,
    page: string,
    properties?: Record<string, any>
  ): Promise<void>;
  trackUserAction(
    userId: string,
    action: string,
    properties?: Record<string, any>
  ): Promise<void>;
  trackError(error: Error, context?: Record<string, any>): Promise<void>;

  // Metrics collection
  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): Promise<void>;
  recordUserMetrics(
    userId: string,
    metrics: Partial<UserMetrics>
  ): Promise<void>;
  recordGameMetrics(
    gameId: string,
    metrics: Partial<GameMetrics>
  ): Promise<void>;
  recordServerMetrics(
    serverId: string,
    metrics: Partial<AnalyticsServerMetrics>
  ): Promise<void>;

  // Queries
  getEvents(filters: EventFilters): Promise<AnalyticsEvent[]>;
  getUserMetrics(userId: string, timeRange?: TimeRange): Promise<UserMetrics>;
  getBusinessMetrics(timeRange: TimeRange): Promise<BusinessMetrics>;
  getCustomMetrics(query: MetricQuery): Promise<MetricResult[]>;

  // Real-time analytics
  getActiveUsers(): Promise<number>;
  getCurrentGameCount(): Promise<number>;
  getServerStatus(): Promise<AnalyticsServerMetrics[]>;

  // Insights
  generateUserInsights(userId: string): Promise<UserInsight[]>;
  generateGameInsights(gameId: string): Promise<GameInsight[]>;
  generateBusinessInsights(timeRange: TimeRange): Promise<BusinessInsight[]>;
}

export interface IMetricsCollector {
  // Collection
  collect(metric: PerformanceMetric): Promise<void>;
  collectBatch(metrics: PerformanceMetric[]): Promise<void>;

  // Aggregation
  aggregate(
    metricName: string,
    timeRange: TimeRange,
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
  ): Promise<number>;
  getTimeSeries(
    metricName: string,
    timeRange: TimeRange,
    interval: string
  ): Promise<TimeSeriesPoint[]>;

  // Alerting
  checkAlerts(): Promise<Alert[]>;
  createAlert(rule: AlertRule): Promise<string>;
  updateAlert(alertId: string, updates: Partial<AlertRule>): Promise<void>;
  deleteAlert(alertId: string): Promise<void>;

  // Health checks
  getSystemHealth(): Promise<SystemHealth>;
  getServiceHealth(serviceName: string): Promise<ServiceHealth>;
}

export interface IReportingService {
  // Dashboard management
  createDashboard(dashboard: Partial<Dashboard>): Promise<Dashboard>;
  updateDashboard(
    dashboardId: string,
    updates: Partial<Dashboard>
  ): Promise<Dashboard>;
  deleteDashboard(dashboardId: string): Promise<void>;
  getDashboard(dashboardId: string): Promise<Dashboard | null>;
  getUserDashboards(userId: string): Promise<Dashboard[]>;

  // Widget management
  addWidget(
    dashboardId: string,
    widget: Partial<DashboardWidget>
  ): Promise<DashboardWidget>;
  updateWidget(
    dashboardId: string,
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): Promise<DashboardWidget>;
  removeWidget(dashboardId: string, widgetId: string): Promise<void>;

  // Report generation
  generateReport(
    type: ReportType,
    parameters: ReportParameters
  ): Promise<Report>;
  scheduleReport(reportConfig: ScheduledReport): Promise<string>;
  cancelScheduledReport(reportId: string): Promise<void>;
  getReportHistory(userId: string): Promise<Report[]>;

  // Data export
  exportData(query: DataExportQuery): Promise<ExportResult>;
  getExportStatus(exportId: string): Promise<ExportStatus>;
}

export interface IUserAnalytics {
  // User behavior
  trackUserJourney(
    userId: string,
    events: AnalyticsEvent[]
  ): Promise<UserJourney>;
  getRetentionAnalysis(
    cohortStart: Date,
    cohortEnd: Date
  ): Promise<RetentionAnalysis>;
  getFunnelAnalysis(funnelSteps: string[]): Promise<FunnelAnalysis>;

  // Segmentation
  segmentUsers(criteria: SegmentationCriteria): Promise<UserSegment[]>;
  getUserSegment(userId: string): Promise<string[]>;

  // Recommendations
  getUserRecommendations(userId: string): Promise<Recommendation[]>;
  getPersonalizationData(userId: string): Promise<PersonalizationData>;
}

export interface IGameAnalytics {
  // Game performance
  getGamePerformance(gameId: string): Promise<GamePerformanceReport>;
  getTablePerformance(tableId: string): Promise<TablePerformanceReport>;

  // Player analysis
  getPlayerBehaviorAnalysis(playerId: string): Promise<PlayerBehaviorReport>;
  detectPlayerPatterns(playerId: string): Promise<PlayerPattern[]>;

  // Game optimization
  getGameOptimizationSuggestions(
    gameType: string
  ): Promise<OptimizationSuggestion[]>;
  analyzeGameBalance(gameId: string): Promise<GameBalanceReport>;
}

// Supporting types
interface EventFilters {
  userId?: string;
  eventType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  properties?: Record<string, any>;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface MetricQuery {
  metric: string;
  filters?: Record<string, string>;
  groupBy?: string[];
  timeRange: TimeRange;
}

interface MetricResult {
  timestamp: Date;
  value: number;
  tags: Record<string, string>;
}

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

interface Alert {
  id: string;
  rule: AlertRule;
  triggeredAt: Date;
  value: number;
  status: 'active' | 'resolved' | 'acknowledged';
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  lastCheck: Date;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  errorRate: number;
  uptime: number;
}

interface UserInsight {
  type: 'behavior' | 'performance' | 'engagement' | 'risk';
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
}

interface GameInsight {
  type: 'balance' | 'engagement' | 'economics' | 'technical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionItems: string[];
}

interface BusinessInsight {
  type: 'revenue' | 'growth' | 'retention' | 'conversion';
  title: string;
  description: string;
  trend: 'positive' | 'negative' | 'stable';
  recommendations: string[];
}

interface UserJourney {
  userId: string;
  stages: JourneyStage[];
  totalDuration: number;
  conversionPoints: ConversionPoint[];
  dropOffPoints: DropOffPoint[];
}

interface JourneyStage {
  name: string;
  events: AnalyticsEvent[];
  duration: number;
  isComplete: boolean;
}

interface ConversionPoint {
  stage: string;
  conversionRate: number;
  factors: string[];
}

interface DropOffPoint {
  stage: string;
  dropOffRate: number;
  reasons: string[];
}

interface RetentionAnalysis {
  cohorts: CohortData[];
  overallRetention: number[];
  insights: string[];
}

interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
}

interface FunnelAnalysis {
  steps: FunnelStep[];
  overallConversion: number;
  dropOffPoints: DropOffPoint[];
}

interface FunnelStep {
  name: string;
  users: number;
  conversionFromPrevious: number;
  dropOff: number;
}

interface UserSegment {
  id: string;
  name: string;
  criteria: SegmentationCriteria;
  userCount: number;
  characteristics: Record<string, any>;
}

interface SegmentationCriteria {
  demographic?: Record<string, any>;
  behavioral?: Record<string, any>;
  geographic?: Record<string, any>;
  psychographic?: Record<string, any>;
}

interface Recommendation {
  type: 'game' | 'table' | 'tournament' | 'feature';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
}

interface PersonalizationData {
  preferences: Record<string, any>;
  behaviors: Record<string, any>;
  predictions: Record<string, number>;
}

interface GamePerformanceReport {
  gameId: string;
  duration: number;
  playerEngagement: number;
  technicalPerformance: Record<string, number>;
  economicMetrics: Record<string, number>;
}

interface TablePerformanceReport {
  tableId: string;
  utilization: number;
  playerSatisfaction: number;
  profitability: number;
  technicalMetrics: Record<string, number>;
}

interface PlayerBehaviorReport {
  playerId: string;
  playStyle: string;
  riskProfile: string;
  engagement: number;
  patterns: PlayerPattern[];
}

interface PlayerPattern {
  type: string;
  description: string;
  frequency: number;
  confidence: number;
}

interface OptimizationSuggestion {
  area: string;
  suggestion: string;
  expectedImpact: string;
  priority: 'low' | 'medium' | 'high';
}

interface GameBalanceReport {
  gameId: string;
  balanceScore: number;
  issues: BalanceIssue[];
  suggestions: string[];
}

interface BalanceIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedPlayers: number;
}

type ReportType = 'user' | 'game' | 'financial' | 'technical' | 'custom';

interface ReportParameters {
  timeRange: TimeRange;
  filters?: Record<string, any>;
  groupBy?: string[];
  metrics?: string[];
}

interface Report {
  id: string;
  type: ReportType;
  name: string;
  data: any;
  generatedAt: Date;
  generatedBy: string;
  format: 'json' | 'csv' | 'pdf' | 'excel';
}

interface ScheduledReport {
  name: string;
  type: ReportType;
  parameters: ReportParameters;
  schedule: string; // cron expression
  recipients: string[];
  format: Report['format'];
}

interface DataExportQuery {
  tables: string[];
  filters?: Record<string, any>;
  timeRange?: TimeRange;
  format: 'csv' | 'json' | 'parquet';
}

interface ExportResult {
  exportId: string;
  downloadUrl: string;
  expiresAt: Date;
  fileSize: number;
}

interface ExportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion?: Date;
  error?: string;
}
