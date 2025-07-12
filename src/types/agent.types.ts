// Agent Management Types

export interface VoiceSettings {
  pitch?: number;
  speed?: number;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ManagedAgent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  type: 'customer-service' | 'sales' | 'support' | 'specialist';
  client: {
    id: string;
    name: string;
    project: string;
  };
  voice: {
    provider: 'elevenlabs' | 'deepgram' | 'custom';
    voiceId: string;
    voiceName?: string;
    audioSample?: string;
    settings: VoiceSettings;
  };
  personality: {
    traits: string[];
    tone: string;
    specialties: string[];
    language: string[];
    origin?: string;
  };
  deployment: {
    status: 'draft' | 'testing' | 'deployed';
    url?: string;
    lastDeployed?: Date;
    environment?: 'development' | 'staging' | 'production';
  };
  configuration: {
    knowledgeBase: string[];
    capabilities: string[];
    restrictions: string[];
    apiKeys?: {
      [key: string]: string;
    };
  };
  stats?: {
    totalInteractions?: number;
    satisfactionRate?: number;
    averageResponseTime?: number;
    lastActive?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
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