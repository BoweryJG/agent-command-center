// Agent Management Types

export interface VoiceSettings {
  pitch?: number;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface VoiceConfig {
  enabled: boolean;
  voiceId?: string;
  settings: VoiceSettings;
}

export interface ManagedAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  description: string;
  personality: {
    traits: string[];
    tone: string;
    specialties: string[];
    language: string[];
  };
  configuration: {
    capabilities: string[];
    knowledgeBase: string[];
    restrictions: string[];
  };
  voiceConfig: VoiceConfig;
  deployment: {
    status: 'draft' | 'testing' | 'deployed';
    url?: string;
    lastDeployed?: Date;
    environment?: 'development' | 'staging' | 'production';
  };
  analytics: {
    totalInteractions: number;
    successRate: number;
    avgResponseTime: number;
    lastActive: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  baseConfig: Partial<ManagedAgent>;
  category: 'dental' | 'medical' | 'retail' | 'support' | 'custom';
}

export interface DeploymentConfig {
  agentId: string;
  targetEnvironment: 'development' | 'staging' | 'production';
  clientId: string;
  projectId: string;
  apiEndpoint: string;
  webhookUrl?: string;
  environmentVariables?: Record<string, string>;
}

// Test and Interaction Types
export interface TestAgentRequest {
  query: string;
  context?: Record<string, any>;
}

export interface TestAgentResponse {
  success: boolean;
  response?: {
    text: string;
    confidence: number;
    processingTime: number;
    intent?: string;
    entities?: Record<string, any>;
  };
  error?: string;
}

export interface InteractAgentRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface InteractAgentResponse {
  success: boolean;
  response?: {
    text: string;
    audioUrl?: string;
    emotion?: string;
    confidence: number;
    suggestedActions?: string[];
  };
  sessionId?: string;
  error?: string;
}

// Deployment Status Types
export type DeploymentStatus = 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled-back';

export interface DeploymentStatusUpdate {
  agentId: string;
  platformId: string;
  status: DeploymentStatus;
  message?: string;
  progress?: number;
  timestamp: Date;
}

export interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

// Voice Preview Types
export interface VoicePreviewRequest {
  voiceId: string;
  text: string;
  settings?: VoiceSettings;
}

export interface VoicePreviewResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

// Analytics Types
export interface AgentAnalytics {
  agentId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  metrics: {
    totalInteractions: number;
    uniqueUsers: number;
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    topIntents: Array<{ intent: string; count: number }>;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  timestamp: Date;
}

// Platform Integration Types
export interface PlatformConfig {
  id: string;
  name: string;
  type: 'pedro' | 'repconnect1' | 'custom';
  apiEndpoint: string;
  authMethod: 'api-key' | 'oauth' | 'jwt';
  credentials: Record<string, string>;
  maxAgents?: number;
  features: string[];
}