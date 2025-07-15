import { ManagedAgent, AgentTemplate, VoiceSettings } from '../types/agent.types';
import { supabase } from '../config/supabase';
import axiosInstance from '../lib/axios';

// API Response Types
interface AgentBackendResponse {
  success: boolean;
  agents?: any[];
  agent?: any;
  error?: string;
}

interface ChatResponse {
  success: boolean;
  response?: {
    text: string;
    confidence?: number;
    processingTime?: number;
    emotion?: string;
    audioUrl?: string;
  };
  sessionId?: string;
  error?: string;
}

interface VoiceResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

interface DeploymentStatus {
  externalId: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled-back';
  message?: string;
  updatedAt: string;
}

class AgentManagementService {
  private readonly AGENTBACKEND_URL = 'https://agentbackend-2932.onrender.com';
  // Use production backend when available, fallback to localhost for development
  private readonly COMMAND_CENTER_BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Fetch all agents from agentbackend and merge with Supabase deployment status
  async getAllAgents(): Promise<ManagedAgent[]> {
    try {
      // Try to get deployed agents first from local backend
      try {
        const deployedResponse = await axiosInstance.get(`${this.COMMAND_CENTER_BACKEND_URL}/api/agents`);
        const deployedData = deployedResponse.data;
        if (deployedData.success && deployedData.agents && deployedData.agents.length > 0) {
          // We have deployed agents, use them
          return this.convertBackendAgentsToManaged(deployedData.agents);
        }
      } catch (deployedError) {
        console.log('No deployed agents found, falling back to agentbackend');
      }

      // Fallback: Fetch from agentbackend
      const response = await axiosInstance.get(`${this.AGENTBACKEND_URL}/api/agents`);
      const data: AgentBackendResponse = response.data;
      
      if (!data.success || !data.agents) {
        throw new Error(data.error || 'Failed to fetch agents');
      }

      // Convert backend agents to ManagedAgent format
      const managedAgents = this.convertBackendAgentsToManaged(data.agents);

      // Fetch deployment statuses from Supabase
      const externalIds = data.agents.map(agent => agent.id);
      const { data: deploymentStatuses, error } = await supabase
        .from('agent_deployment_status')
        .select('*')
        .in('external_agent_id', externalIds);

      if (error) {
        console.error('Error fetching deployment statuses:', error);
      }

      // Merge deployment statuses with agents
      if (deploymentStatuses) {
        const statusMap = new Map(
          deploymentStatuses.map(status => [status.external_agent_id, status])
        );

        managedAgents.forEach(agent => {
          const status = statusMap.get(agent.id);
          if (status) {
            agent.deployment.status = status.deployment_status;
            agent.deployment.lastDeployed = new Date(status.updated_at);
          }
        });
      }

      return managedAgents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  // Get a single agent by ID
  async getAgent(id: string): Promise<ManagedAgent | null> {
    try {
      const response = await axiosInstance.get(`${this.AGENTBACKEND_URL}/api/agents/${id}`);
      const data: AgentBackendResponse = response.data;
      
      if (!data.success || !data.agent) {
        throw new Error(data.error || 'Failed to fetch agent');
      }

      const managedAgent = this.convertBackendAgentsToManaged([data.agent])[0];

      // Fetch deployment status from Supabase
      const { data: deploymentStatus, error } = await supabase
        .from('agent_deployment_status')
        .select('*')
        .eq('external_agent_id', id)
        .single();

      if (!error && deploymentStatus) {
        managedAgent.deployment.status = deploymentStatus.deployment_status;
        managedAgent.deployment.lastDeployed = new Date(deploymentStatus.updated_at);
      }

      return managedAgent;
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  // Test agent with a message
  async testAgent(id: string, testData: { message: string; context?: Record<string, string> }): Promise<any> {
    try {
      const response = await axiosInstance.post(`${this.COMMAND_CENTER_BACKEND_URL}/api/agents/${id}/test`, testData);
      return response.data;
    } catch (error: any) {
      console.error('Error testing agent:', error);
      throw new Error(error.response?.data?.error || error.message || 'Request failed');
    }
  }

  // Interact with agent
  async interactWithAgent(id: string, interactionData: { message: string; sessionId?: string; history?: any[] }): Promise<any> {
    try {
      const response = await axiosInstance.post(`${this.COMMAND_CENTER_BACKEND_URL}/api/agents/${id}/interact`, interactionData);
      return response.data;
    } catch (error: any) {
      console.error('Error interacting with agent:', error);
      throw new Error(error.response?.data?.error || error.message || 'Request failed');
    }
  }

  // Generate voice preview
  async generateVoicePreview(id: string, text: string, settings?: VoiceSettings): Promise<VoiceResponse> {
    try {
      const response = await axiosInstance.post(`${this.COMMAND_CENTER_BACKEND_URL}/api/voices`, {
        agentId: id,
        text,
        settings
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating voice preview:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error occurred'
      };
    }
  }

  // Update deployment status in Supabase only
  async updateDeploymentStatus(
    externalId: string, 
    status: 'draft' | 'testing' | 'deployed',
    configuration?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agent_deployment_status')
        .upsert({
          external_agent_id: externalId,
          deployment_status: status,
          configuration: configuration || {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'external_agent_id'
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating deployment status:', error);
      return false;
    }
  }

  // Get deployment status from Supabase
  async getDeploymentStatus(externalId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('agent_deployment_status')
        .select('*')
        .eq('external_agent_id', externalId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching deployment status:', error);
      return null;
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

  // Import agents designated for Pedro from agent backend
  async importPedroAgents(): Promise<ManagedAgent[]> {
    try {
      // Call the command center backend sync endpoint with pedro platform filter
      const response = await axiosInstance.get(`${this.COMMAND_CENTER_BACKEND_URL}/api/agent-sync/sync-from-backend?platform=pedro&save=true`);
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to sync Pedro agents');
      }

      // Refresh the agent list to show the imported agents
      return await this.getAllAgents();
    } catch (error) {
      console.error('Error importing Pedro agents:', error);
      throw error;
    }
  }

  // Deploy agent to a specific platform
  async deployAgent(deploymentConfig: any): Promise<boolean> {
    try {
      const { agentId, targetEnvironment } = deploymentConfig;
      
      // Determine the correct endpoint based on platform
      let endpoint = '';
      if (targetEnvironment === 'pedro') {
        endpoint = `${this.COMMAND_CENTER_BACKEND_URL}/api/agent-sync/deploy-to-pedro/${agentId}`;
      } else if (targetEnvironment === 'repconnect1') {
        endpoint = `${this.COMMAND_CENTER_BACKEND_URL}/api/agent-sync/deploy-to-repconnect1/${agentId}`;
      } else {
        throw new Error(`Unknown target environment: ${targetEnvironment}`);
      }

      const response = await axiosInstance.post(endpoint, {});
      const data = response.data;
      
      if (!data.success) {
        throw new Error(data.error || 'Deployment failed');
      }

      // Update local deployment status
      await this.updateDeploymentStatus(agentId, 'deployed', {
        platform: targetEnvironment,
        deployedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error deploying agent:', error);
      throw error;
    }
  }

  // Delete an agent
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      // Delete from agent backend
      await axiosInstance.delete(`${this.AGENTBACKEND_URL}/api/agents/${agentId}`);

      // Also delete deployment status from Supabase
      const { error } = await supabase
        .from('agent_deployment_status')
        .delete()
        .eq('external_agent_id', agentId);

      if (error) {
        console.error('Error deleting deployment status:', error);
      }

      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
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

  // Get voice metadata
  async getVoiceMetadata(voiceId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`${this.AGENTBACKEND_URL}/api/voices/${voiceId}/metadata`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voice metadata:', error);
      throw error;
    }
  }

  // Preview voice
  async previewVoice(data: { voiceId: string; text: string; settings?: any }): Promise<Blob> {
    try {
      // First try the API endpoint
      const response = await axiosInstance.post(`${this.COMMAND_CENTER_BACKEND_URL}/api/voices/preview`, data, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      // Fallback to browser TTS
      console.log('Using browser text-to-speech as fallback');
      const { ttsService } = await import('./textToSpeech.service');
      return await ttsService.generateAudioBlob(data.text, {
        voiceId: data.voiceId,
        ...data.settings
      });
    }
  }
}

export const agentManagementService = new AgentManagementService();