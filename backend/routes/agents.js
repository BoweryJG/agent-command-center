const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const fs = require('fs').promises;
const path = require('path');

// Import Pedro agents
router.post('/import-pedro', async (req, res, next) => {
  try {
    // Convert Pedro agents to managed agents format
    const pedroAgents = [
      {
        name: 'Julie',
        role: 'Care Coordinator',
        type: 'customer-service',
        avatar: '👩‍⚕️',
        client: {
          id: 'pedro-dental',
          name: 'Dr. Pedro Dental Practice',
          project: 'Main Practice'
        },
        voice: {
          provider: 'elevenlabs',
          voiceId: 'nicole',
          voiceName: 'Nicole',
          settings: {}
        },
        personality: {
          traits: ['Professional', 'Warm', 'Knowledgeable'],
          tone: 'friendly-professional',
          specialties: ['General dentistry', 'Patient comfort', 'Scheduling'],
          language: ['English']
        },
        deployment: {
          status: 'draft'
        },
        configuration: {
          knowledgeBase: ['dental-procedures', 'office-policies', 'insurance-info'],
          capabilities: ['scheduling', 'insurance-check', 'basic-dental-info'],
          restrictions: ['no-medical-advice', 'no-diagnosis']
        }
      },
      {
        name: 'Brian',
        role: 'Senior Advisor',
        type: 'customer-service',
        avatar: '👨‍⚕️',
        client: {
          id: 'pedro-dental',
          name: 'Dr. Pedro Dental Practice',
          project: 'Main Practice'
        },
        voice: {
          provider: 'elevenlabs',
          voiceId: 'nPczCjzI2devNBz1zQrb',
          voiceName: 'Brian',
          audioSample: 'brian_excited_herald.mp3',
          settings: {}
        },
        personality: {
          traits: ['Confident', 'Experienced', 'Reassuring'],
          tone: 'confident-professional',
          specialties: ['Complex procedures', 'Treatment planning', 'Insurance'],
          language: ['English']
        },
        deployment: {
          status: 'draft'
        },
        configuration: {
          knowledgeBase: ['dental-procedures', 'treatment-plans', 'insurance-details'],
          capabilities: ['consultation', 'treatment-explanation', 'cost-breakdown'],
          restrictions: ['no-medical-advice', 'no-diagnosis']
        }
      },
      {
        name: 'Maria',
        role: 'Office Manager',
        type: 'customer-service',
        avatar: '💁‍♀️',
        client: {
          id: 'pedro-dental',
          name: 'Dr. Pedro Dental Practice',
          project: 'Staten Island Office'
        },
        voice: {
          provider: 'elevenlabs',
          voiceId: 'EXAVITQu4vr4xnSDxMaL',
          voiceName: 'Sarah',
          audioSample: 'si_maria_professional.mp3',
          settings: {}
        },
        personality: {
          traits: ['No-nonsense', 'Efficient', 'Local'],
          tone: 'direct-friendly',
          specialties: ['Quick scheduling', 'Local insurance', 'Straight talk'],
          language: ['English'],
          origin: 'Staten Island'
        },
        deployment: {
          status: 'draft'
        },
        configuration: {
          knowledgeBase: ['dental-procedures', 'insurance-policies', 'local-resources'],
          capabilities: ['scheduling', 'billing', 'insurance-verification'],
          restrictions: ['no-medical-advice']
        }
      }
    ];
    
    // Insert agents into the database
    const { data, error } = await supabase
      .from('managed_agents')
      .insert(pedroAgents)
      .select();
    
    if (error) {
      console.error('Error inserting agents:', error);
      return res.status(500).json({ error: 'Failed to import agents' });
    }
    
    res.json({
      success: true,
      agents: data,
      message: `Successfully imported ${data.length} agents from Pedro project`
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/agents - list all agents with deployment status
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('managed_agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add deployment status summary
    const agentsWithStatus = data.map(agent => ({
      ...agent,
      deploymentStatus: agent.deployment?.status || 'draft'
    }));
    
    res.json(agentsWithStatus);
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/stats - get counts of live, ready, and draft agents
router.get('/stats', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('managed_agents')
      .select('deployment');
    
    if (error) throw error;
    
    const stats = {
      total: data.length,
      live: data.filter(agent => agent.deployment?.status === 'deployed').length,
      ready: data.filter(agent => agent.deployment?.status === 'ready').length,
      draft: data.filter(agent => !agent.deployment?.status || agent.deployment?.status === 'draft').length
    };
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/:id - get single agent details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('managed_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create new agent
router.post('/', async (req, res, next) => {
  try {
    const agentData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'role', 'client', 'voice', 'personality'];
    for (const field of requiredFields) {
      if (!agentData[field]) {
        return res.status(400).json({
          error: { message: `Missing required field: ${field}` }
        });
      }
    }
    
    const { data, error } = await supabase
      .from('managed_agents')
      .insert([agentData])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// PUT /api/agents/:id - update agent configuration
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate updates don't include protected fields
    const protectedFields = ['id', 'created_at'];
    for (const field of protectedFields) {
      if (field in updates) {
        delete updates[field];
      }
    }
    
    // Update modified timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('managed_agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/agents/:id - delete agent (with confirmations)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirm } = req.query;
    
    // First, check if agent exists and get its details
    const { data: agent, error: fetchError } = await supabase
      .from('managed_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      throw fetchError;
    }
    
    // Check if agent is deployed
    if (agent.deployment?.status === 'deployed' && confirm !== 'true') {
      return res.status(400).json({
        error: {
          message: 'Agent is currently deployed. Add ?confirm=true to force deletion.',
          requiresConfirmation: true,
          agent: {
            id: agent.id,
            name: agent.name,
            deploymentStatus: agent.deployment.status
          }
        }
      });
    }
    
    // Proceed with deletion
    const { error: deleteError } = await supabase
      .from('managed_agents')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.json({
      success: true,
      message: `Agent "${agent.name}" has been deleted successfully`,
      deletedAgent: {
        id: agent.id,
        name: agent.name
      }
    });
  } catch (error) {
    next(error);
  }
});

// Deploy agent
router.post('/deploy', async (req, res, next) => {
  try {
    const { agentId, targetEnvironment, clientId, projectId, apiEndpoint } = req.body;
    
    // Here you would implement the actual deployment logic
    // For now, we'll just update the agent's deployment status
    
    const { data, error } = await supabase
      .from('managed_agents')
      .update({
        deployment: {
          status: 'deployed',
          url: apiEndpoint,
          lastDeployed: new Date().toISOString(),
          environment: targetEnvironment
        }
      })
      .eq('id', agentId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      agent: data,
      message: 'Agent deployed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/agents/:id/test - test agent with sample input
router.post('/:id/test', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { input, context = {} } = req.body;
    
    if (!input) {
      return res.status(400).json({
        error: { message: 'Test input is required' }
      });
    }
    
    // Fetch agent details
    const { data: agent, error: fetchError } = await supabase
      .from('managed_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      throw fetchError;
    }
    
    // Simulate agent response based on personality and configuration
    const testResponse = {
      agentId: agent.id,
      agentName: agent.name,
      input: input,
      response: `Hello! I'm ${agent.name}, your ${agent.role}. ${input.includes('?') ? 'How can I help you today?' : 'Thank you for reaching out!'}`,
      personality: agent.personality,
      timestamp: new Date().toISOString(),
      testMode: true,
      context: {
        ...context,
        capabilities: agent.configuration?.capabilities || [],
        knowledgeBase: agent.configuration?.knowledgeBase || []
      }
    };
    
    // Log test interaction (ignore errors if table doesn't exist)
    try {
      await supabase
        .from('agent_test_logs')
        .insert({
          agent_id: id,
          input: input,
          response: testResponse.response,
          context: context
        });
    } catch (logError) {
      console.log('Test log table might not exist yet:', logError.message);
    }
    
    res.json(testResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/agents/:id/interact - real-time interaction endpoint
router.post('/:id/interact', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, sessionId, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: { message: 'Message is required' }
      });
    }
    
    // Fetch agent details
    const { data: agent, error: fetchError } = await supabase
      .from('managed_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      throw fetchError;
    }
    
    // Check if agent is deployed
    if (agent.deployment?.status !== 'deployed') {
      return res.status(400).json({
        error: { 
          message: 'Agent is not deployed. Deploy the agent before interacting.',
          currentStatus: agent.deployment?.status || 'draft'
        }
      });
    }
    
    // Here you would integrate with your actual AI/LLM service
    // For now, we'll simulate a contextual response
    const interaction = {
      agentId: agent.id,
      agentName: agent.name,
      sessionId: sessionId || `session_${Date.now()}`,
      message: message,
      response: generateAgentResponse(agent, message, context),
      timestamp: new Date().toISOString(),
      voice: agent.voice,
      personality: agent.personality,
      context: {
        ...context,
        capabilities: agent.configuration?.capabilities || [],
        client: agent.client
      }
    };
    
    // Log interaction (ignore errors if table doesn't exist)
    try {
      await supabase
        .from('agent_interactions')
        .insert({
          agent_id: id,
          session_id: interaction.sessionId,
          user_message: message,
          agent_response: interaction.response,
          context: context
        });
    } catch (logError) {
      console.log('Interaction log table might not exist yet:', logError.message);
    }
    
    res.json(interaction);
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/:id/voice-preview - get voice sample
router.get('/:id/voice-preview', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.query;
    
    // Fetch agent details
    const { data: agent, error: fetchError } = await supabase
      .from('managed_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Agent not found' } });
      }
      throw fetchError;
    }
    
    // Check if agent has voice configuration
    if (!agent.voice) {
      return res.status(400).json({
        error: { message: 'Agent does not have voice configuration' }
      });
    }
    
    // Return voice sample information
    const voicePreview = {
      agentId: agent.id,
      agentName: agent.name,
      voice: {
        provider: agent.voice.provider,
        voiceId: agent.voice.voiceId,
        voiceName: agent.voice.voiceName,
        settings: agent.voice.settings || {}
      },
      sampleText: text || `Hello, I'm ${agent.name}, your ${agent.role}. How can I assist you today?`,
      audioSample: agent.voice.audioSample || null,
      previewUrl: agent.voice.audioSample ? `/audio/samples/${agent.voice.audioSample}` : null
    };
    
    res.json(voicePreview);
  } catch (error) {
    next(error);
  }
});

// Helper function to generate contextual agent responses
function generateAgentResponse(agent, message, context) {
  const { personality, configuration } = agent;
  const tone = personality?.tone || 'professional';
  const traits = personality?.traits || [];
  
  // Simple response generation based on agent personality
  let response = '';
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    response = `Hello! I'm ${agent.name}, your ${agent.role}. `;
  } else if (message.toLowerCase().includes('help')) {
    response = `I'm here to help you with ${configuration?.capabilities?.join(', ') || 'your needs'}. `;
  } else if (message.toLowerCase().includes('appointment') || message.toLowerCase().includes('schedule')) {
    response = `I'd be happy to help you with scheduling. `;
  } else {
    response = `I understand you're asking about "${message}". `;
  }
  
  // Add personality-based suffix
  if (tone === 'friendly-professional') {
    response += 'How can I assist you today?';
  } else if (tone === 'confident-professional') {
    response += 'Let me help you with that right away.';
  } else if (tone === 'direct-friendly') {
    response += 'What do you need?';
  } else {
    response += 'How may I help you?';
  }
  
  return response;
}

module.exports = router;