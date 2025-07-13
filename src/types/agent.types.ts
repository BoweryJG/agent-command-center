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