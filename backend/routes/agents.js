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

// Get all agents
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('managed_agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get agent by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('managed_agents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: { message: 'Agent not found' } });
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

// Update agent
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('managed_agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: { message: 'Agent not found' } });
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete agent
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('managed_agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.status(204).send();
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

module.exports = router;