import { ManagedAgent, AgentTemplate, DeploymentConfig, VoiceSettings } from '../types/agent.types';
import { supabase } from './supabase.service';

// API Response Types
interface AgentBackendResponse {
  success: boolean;
  agents?: any[];
  error?: string;
}

interface DeploymentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ImportResponse {
  success: boolean;
  agents: ManagedAgent[];
  error?: string;
}

interface VoiceTestResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

interface TestAgentResponse {
  success: boolean;
  response?: {
    text: string;
    confidence: number;
    processingTime: number;
  };
  error?: string;
}

interface InteractAgentResponse {
  success: boolean;
  response?: {
    text: string;
    audioUrl?: string;
    emotion?: string;
    confidence: number;
  };
  sessionId?: string;
  error?: string;
}

interface VoicePreviewResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

class AgentManagementService {
  private readonly AGENTBACKEND_URL = process.env.REACT_APP_API_URL || 'https://agentbackend-2932.onrender.com';
  private readonly BACKEND_URL = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'https://agentbackend-2932.onrender.com';

  // Fetch all agents from centralized agentbackend
  async getAllAgents(): Promise<ManagedAgent[]> {
    try {
      // First fetch from agentbackend
      const response = await fetch(`${this.AGENTBACKEND_URL}/api/agents`);
      if (response.ok) {
        const data: AgentBackendResponse = await response.json();
        if (data.success && data.agents) {
          return this.convertBackendAgentsToManaged(data.agents);
        }
      }

      // Fallback to local database
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Convert Supabase data to ManagedAgent format
      return data ? data.map(agent => ({
        ...agent,
        createdAt: new Date(agent.created_at || agent.createdAt),
        updatedAt: new Date(agent.updated_at || agent.updatedAt)
      })) : [];
    } catch (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
  }

  // Convert agentbackend format to ManagedAgent format
  private convertBackendAgentsToManaged(backendAgents: any[]): ManagedAgent[] {
    return backendAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.category || 'general',
      status: agent.active ? 'active' : 'inactive',
      description: agent.tagline || agent.role || '',
      personality: {
        traits: agent.personality?.traits || [],
        tone: agent.personality?.tone || agent.personality?.communication_style || 'professional',
        specialties: agent.personality?.specialties || [],
        language: [agent.language || 'en']
      },
      configuration: {
        capabilities: Object.keys(agent.capabilities || {}).filter(key => agent.capabilities[key]),
        knowledgeBase: agent.personality?.specialties || [],
        restrictions: []
      },
      voiceConfig: {
        enabled: agent.voice_config?.enabled || false,
        voiceId: agent.voice_config?.voice_id || agent.voiceId || 'default',
        settings: {
          stability: agent.voice_config?.settings?.stability || 0.7,
          similarityBoost: agent.voice_config?.settings?.similarityBoost || 0.8,
          style: agent.voice_config?.settings?.style || 0.5,
          speakerBoost: agent.voice_config?.settings?.useSpeakerBoost !== false
        }
      },
      deployment: {
        status: 'deployed',
        url: this.AGENTBACKEND_URL,
        lastDeployed: new Date(),
        environment: 'production'
      },
      analytics: {
        totalInteractions: 0,
        successRate: 95,
        avgResponseTime: 1.2,
        lastActive: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [agent.category, agent.subcategory].filter(Boolean)
    }));
  }

  // Get a single agent by ID
  async getAgent(id: string): Promise<ManagedAgent | null> {
    try {
      // First try to fetch from local database
      const { data, error } = await supabase
        .from('managed_agents')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data;
      }

      // If not found locally, try to fetch from agentbackend
      const response = await fetch(`${this.AGENTBACKEND_URL}/api/agents/${id}`);
      if (response.ok) {
        const agentData = await response.json();
        if (agentData) {
          return this.convertBackendAgentsToManaged([agentData])[0];
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
  }

  // Create a new agent
  async createAgent(agent: Omit<ManagedAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ManagedAgent | null> {
    try {
      const { data, error } = await supabase
        .from('managed_agents')
        .insert({
          ...agent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating agent:', error);
      return null;
    }
  }

  // Update an agent
  async updateAgent(id: string, updates: Partial<ManagedAgent>): Promise<ManagedAgent | null> {
    try {
      const { data, error } = await supabase
        .from('managed_agents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating agent:', error);
      return null;
    }
  }

  // Delete an agent
  async deleteAgent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('managed_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  // Deploy agent to client project
  async deployAgent(config: DeploymentConfig): Promise<boolean> {
    try {
      // Call backend API to deploy agent
      const response = await fetch(`${this.BACKEND_URL}/api/agents/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Deployment failed');
      }

      const data: DeploymentResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Deployment failed');
      }

      // Update agent deployment status
      await this.updateAgent(config.agentId, {
        deployment: {
          status: 'deployed',
          url: config.apiEndpoint,
          lastDeployed: new Date(),
          environment: config.targetEnvironment
        }
      });

      return true;
    } catch (error) {
      console.error('Error deploying agent:', error);
      return false;
    }
  }

  // Import agents from Pedro project
  async importPedroAgents(): Promise<ManagedAgent[]> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/agents/import-pedro`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Import failed');
      }

      const data: ImportResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }
      
      return data.agents;
    } catch (error) {
      console.error('Error importing Pedro agents:', error);
      return [];
    }
  }

  // Get agent templates
  async getAgentTemplates(): Promise<AgentTemplate[]> {
    // These could come from a database or be hardcoded
    return [
      {
        id: 'dental-receptionist',
        name: 'Dental Receptionist',
        description: 'Professional dental office receptionist for appointment scheduling and patient inquiries',
        category: 'dental',
        baseConfig: {
          type: 'customer-service',
          description: 'Professional dental office receptionist for appointment scheduling and patient inquiries',
          personality: {
            traits: ['Professional', 'Warm', 'Efficient'],
            tone: 'friendly-professional',
            specialties: ['Appointment scheduling', 'Insurance verification', 'Patient inquiries'],
            language: ['English']
          },
          configuration: {
            capabilities: ['scheduling', 'insurance-check', 'basic-dental-info'],
            knowledgeBase: ['dental-procedures', 'office-policies', 'insurance-info'],
            restrictions: ['no-medical-advice', 'no-diagnosis']
          },
          voiceConfig: {
            enabled: true,
            voiceId: 'default',
            settings: {
              stability: 0.7,
              similarityBoost: 0.8,
              style: 0.5,
              useSpeakerBoost: true
            }
          }
        }
      },
      {
        id: 'sales-specialist',
        name: 'Sales Specialist',
        description: 'Engaging sales agent for product inquiries and conversions',
        category: 'retail',
        baseConfig: {
          type: 'sales',
          description: 'Engaging sales agent for product inquiries and conversions',
          personality: {
            traits: ['Enthusiastic', 'Knowledgeable', 'Persuasive'],
            tone: 'upbeat-professional',
            specialties: ['Product knowledge', 'Objection handling', 'Closing deals'],
            language: ['English']
          },
          configuration: {
            capabilities: ['product-info', 'pricing', 'order-processing'],
            knowledgeBase: ['product-catalog', 'pricing-tiers', 'promotions'],
            restrictions: ['no-false-claims', 'ethical-selling']
          },
          voiceConfig: {
            enabled: true,
            voiceId: 'default',
            settings: {
              stability: 0.7,
              similarityBoost: 0.8,
              style: 0.5,
              useSpeakerBoost: true
            }
          }
        }
      }
    ];
  }

  // Test agent voice
  async testAgentVoice(agentId: string, text: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/voice/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId, text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Voice test failed');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error testing voice:', error);
      return null;
    }
  }

  // Test agent with a sample query
  async testAgent(agentId: string, query: string): Promise<TestAgentResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/agents/${agentId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Agent test failed');
      }

      const data: TestAgentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Interactive chat with agent
  async interactWithAgent(agentId: string, message: string, sessionId?: string): Promise<InteractAgentResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/agents/${agentId}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Interaction failed');
      }

      const data: InteractAgentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error interacting with agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Generate voice preview for text
  async generateVoicePreview(voiceId: string, text: string, settings?: VoiceSettings): Promise<VoicePreviewResponse> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/voice/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceId, text, settings })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Voice preview failed');
      }

      const data: VoicePreviewResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating voice preview:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Check agent deployment status
  async checkDeploymentStatus(agentId: string, platformId: string): Promise<{
    status: 'pending' | 'deploying' | 'deployed' | 'failed';
    message?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/deployments/status/${agentId}/${platformId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Status check failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking deployment status:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const agentManagementService = new AgentManagementService();