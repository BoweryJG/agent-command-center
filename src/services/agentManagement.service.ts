import { ManagedAgent, AgentTemplate, DeploymentConfig } from '../types/agent.types';
import { supabase } from './supabase.service';

class AgentManagementService {
  private readonly AGENTBACKEND_URL = 'https://agentbackend-2932.onrender.com';

  // Fetch all agents from centralized agentbackend
  async getAllAgents(): Promise<ManagedAgent[]> {
    try {
      // First fetch from agentbackend
      const response = await fetch(`${this.AGENTBACKEND_URL}/api/agents`);
      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/agents/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error('Deployment failed');

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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/agents/import-pedro`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Import failed');

      const { agents } = await response.json();
      return agents;
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'}/api/voice/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId, text })
      });

      if (!response.ok) throw new Error('Voice test failed');

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error testing voice:', error);
      return null;
    }
  }
}

export const agentManagementService = new AgentManagementService();