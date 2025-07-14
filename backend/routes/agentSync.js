const express = require('express');
const axios = require('axios');
const router = express.Router();
const supabase = require('../utils/supabase');
const deploymentService = require('../services/deploymentService');

// Track sync operations
const createSyncRecord = async (operation, status, details = {}) => {
  try {
    await supabase
      .from('sync_logs')
      .insert({
        operation,
        status,
        details,
        synced_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error creating sync record:', error);
  }
};

// Map agent data structure from external backend to local format
const mapExternalAgentToLocal = (externalAgent, source) => {
  return {
    external_id: externalAgent.id || externalAgent._id,
    external_source: source,
    name: externalAgent.name || externalAgent.agentName,
    description: externalAgent.description || externalAgent.role,
    type: mapAgentType(externalAgent.type || externalAgent.agentType),
    
    // Configuration mapping
    config: {
      model: externalAgent.model || externalAgent.config?.model,
      temperature: externalAgent.temperature || externalAgent.config?.temperature,
      max_tokens: externalAgent.max_tokens || externalAgent.config?.max_tokens,
      ...externalAgent.config
    },
    
    // Capabilities
    capabilities: externalAgent.capabilities || externalAgent.skills || [],
    
    // Personality traits
    personality_traits: externalAgent.personality || externalAgent.personality_traits || [],
    
    // Voice configuration
    voice_config: externalAgent.voice_config || externalAgent.voiceConfig || {
      provider: externalAgent.voiceProvider,
      voice_id: externalAgent.voiceId,
      settings: externalAgent.voiceSettings
    },
    
    // Knowledge base
    knowledge_base: externalAgent.knowledge_base || externalAgent.knowledgeBase || {},
    
    // Procedures access
    procedures_access: externalAgent.procedures_access || externalAgent.proceduresAccess || [],
    
    // Deployment info
    deployment_info: {
      deployed_to: externalAgent.deployed_to || externalAgent.platforms || [],
      deployment_status: externalAgent.deployment_status || 'unknown',
      last_deployed: externalAgent.last_deployed || externalAgent.lastDeployed
    },
    
    // Status
    is_active: externalAgent.is_active !== undefined ? externalAgent.is_active : true,
    status: mapAgentStatus(externalAgent.status),
    
    // Timestamps
    external_created_at: externalAgent.created_at || externalAgent.createdAt,
    external_updated_at: externalAgent.updated_at || externalAgent.updatedAt
  };
};

// Map agent types to standardized values
const mapAgentType = (type) => {
  const typeMap = {
    'customer-service': 'patient-care',
    'customer_service': 'patient-care',
    'patient-care': 'patient-care',
    'sales': 'sales',
    'support': 'support',
    'specialist': 'specialist',
    'general': 'support'
  };
  return typeMap[type?.toLowerCase()] || 'support';
};

// Map agent status to standardized values
const mapAgentStatus = (status) => {
  const statusMap = {
    'active': 'active',
    'online': 'active',
    'offline': 'idle',
    'inactive': 'idle',
    'error': 'error',
    'maintenance': 'maintenance'
  };
  return statusMap[status?.toLowerCase()] || 'idle';
};

// Sync agents from agent backend to show available agents
router.get('/sync-from-backend', async (req, res) => {
  const syncStartTime = Date.now();
  
  try {
    const agentBackendUrl = process.env.AGENT_BACKEND_URL || 'https://agentbackend-2932.onrender.com';
    
    if (!agentBackendUrl) {
      throw new Error('AGENT_BACKEND_URL not configured');
    }
    
    // Fetch all agents from agent backend
    const response = await axios.get(`${agentBackendUrl}/api/agents`, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgentCommandCenter/1.0'
      }
    });
    
    const externalAgents = Array.isArray(response.data) ? response.data : response.data.agents || [];
    
    // Map external agents to local format
    const mappedAgents = externalAgents.map(agent => 
      mapExternalAgentToLocal(agent, 'agentbackend-2932')
    );
    
    // Filter agents by platform if specified
    const platform = req.query.platform; // 'pedro', 'repconnect1', or 'agent-command-center'
    let filteredAgents = mappedAgents;
    
    if (platform) {
      filteredAgents = mappedAgents.filter(agent => {
        const deployedTo = agent.deployment_info.deployed_to || [];
        return deployedTo.includes(platform);
      });
    }
    
    // Save to local database if requested
    if (req.query.save === 'true') {
      const saveResults = await saveAgentsToDatabase(filteredAgents);
      
      // Record sync operation
      await createSyncRecord('sync-from-backend', 'success', {
        total_fetched: externalAgents.length,
        total_mapped: mappedAgents.length,
        total_filtered: filteredAgents.length,
        saved: saveResults.saved,
        updated: saveResults.updated,
        errors: saveResults.errors,
        platform_filter: platform || 'none',
        duration_ms: Date.now() - syncStartTime
      });
      
      res.json({
        success: true,
        agents: filteredAgents,
        total: filteredAgents.length,
        source: 'agent-backend',
        sync_results: saveResults,
        sync_timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        agents: filteredAgents,
        total: filteredAgents.length,
        source: 'agent-backend',
        sync_timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error syncing agents from backend:', error);
    
    // Record failed sync
    await createSyncRecord('sync-from-backend', 'failed', {
      error: error.message,
      duration_ms: Date.now() - syncStartTime
    });
    
    res.status(500).json({ 
      error: 'Failed to sync agents from backend',
      details: error.message 
    });
  }
});

// Save agents to local Supabase database
const saveAgentsToDatabase = async (agents) => {
  const results = {
    saved: 0,
    updated: 0,
    errors: []
  };
  
  for (const agent of agents) {
    try {
      // Check if agent already exists by external_id
      const { data: existing, error: checkError } = await supabase
        .from('agents')
        .select('id')
        .eq('external_id', agent.external_id)
        .eq('external_source', agent.external_source)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        throw checkError;
      }
      
      if (existing) {
        // Update existing agent
        const { error: updateError } = await supabase
          .from('agents')
          .update({
            name: agent.name,
            description: agent.description,
            type: agent.type,
            config: agent.config,
            capabilities: agent.capabilities,
            personality_traits: agent.personality_traits,
            voice_config: agent.voice_config,
            knowledge_base: agent.knowledge_base,
            procedures_access: agent.procedures_access,
            deployment_info: agent.deployment_info,
            is_active: agent.is_active,
            status: agent.status,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (updateError) throw updateError;
        results.updated++;
      } else {
        // Insert new agent
        const { error: insertError } = await supabase
          .from('agents')
          .insert({
            ...agent,
            last_synced_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
        results.saved++;
      }
    } catch (error) {
      console.error(`Error saving agent ${agent.name}:`, error);
      results.errors.push({
        agent: agent.name,
        error: error.message
      });
    }
  }
  
  return results;
};

// Check agent deployment status across platforms
router.get('/check-deployment-status/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Get agent from database
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    
    if (agentError) throw agentError;
    if (!agent) throw new Error('Agent not found');
    
    // Get deployment status from deployment service
    const deploymentStatus = await deploymentService.getAgentDeploymentStatus(agentId);
    
    // Check live status on each platform
    const platformStatuses = await checkPlatformStatuses(agent.external_id || agentId);
    
    res.json({
      success: true,
      agent_id: agentId,
      agent_name: agent.name,
      deployment_status: deploymentStatus,
      platform_statuses: platformStatuses,
      last_checked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking deployment status:', error);
    res.status(500).json({
      error: 'Failed to check deployment status',
      details: error.message
    });
  }
});

// Check if agent is live on various platforms
const checkPlatformStatuses = async (agentId) => {
  const platforms = {
    pedro: process.env.PEDRO_BACKEND_URL,
    repconnect1: process.env.REPCONNECT1_BACKEND_URL,
    'agent-command-center': process.env.AGENT_COMMAND_CENTER_URL
  };
  
  const statuses = {};
  
  for (const [platform, url] of Object.entries(platforms)) {
    if (!url) {
      statuses[platform] = {
        status: 'not_configured',
        message: 'Platform URL not configured'
      };
      continue;
    }
    
    try {
      const response = await axios.get(`${url}/api/agents/${agentId}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200 && response.data) {
        statuses[platform] = {
          status: 'deployed',
          is_active: response.data.is_active || response.data.status === 'active',
          last_seen: response.data.last_active_at || response.data.lastActiveAt,
          version: response.data.version
        };
      } else if (response.status === 404) {
        statuses[platform] = {
          status: 'not_deployed',
          message: 'Agent not found on platform'
        };
      } else {
        statuses[platform] = {
          status: 'unknown',
          message: `Unexpected response: ${response.status}`
        };
      }
    } catch (error) {
      statuses[platform] = {
        status: 'error',
        message: error.message
      };
    }
  }
  
  return statuses;
};

// Deploy specific agent to Pedro
router.post('/deploy-to-pedro/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agentBackendUrl = process.env.AGENT_BACKEND_URL || 'https://agentbackend-2932.onrender.com';
    
    // Get agent details from database
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    
    if (agentError) throw agentError;
    if (!agent) throw new Error('Agent not found');
    
    // Use external_id if available, otherwise use internal id
    const deploymentId = agent.external_id || agentId;
    
    // Trigger deployment to Pedro via agent backend
    const response = await axios.post(`${agentBackendUrl}/api/agents/${deploymentId}/deploy/pedro`, {
      source: 'agent-command-center',
      deployment_metadata: {
        internal_id: agentId,
        agent_name: agent.name,
        deployment_timestamp: new Date().toISOString()
      }
    });
    
    // Update local deployment tracking
    await deploymentService.recordDeployment(agentId, 'pedro', response.data);
    
    res.json({
      success: true,
      message: `Agent ${agent.name} deployed to Pedro`,
      deployment_id: deploymentId,
      data: response.data
    });
  } catch (error) {
    console.error('Error deploying to Pedro:', error);
    res.status(500).json({ 
      error: 'Failed to deploy agent to Pedro',
      details: error.message 
    });
  }
});

// Deploy specific agent to RepConnect1
router.post('/deploy-to-repconnect1/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agentBackendUrl = process.env.AGENT_BACKEND_URL || 'https://agentbackend-2932.onrender.com';
    
    // Get agent details from database
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    
    if (agentError) throw agentError;
    if (!agent) throw new Error('Agent not found');
    
    // Use external_id if available, otherwise use internal id
    const deploymentId = agent.external_id || agentId;
    
    // Trigger deployment to RepConnect1 via agent backend
    const response = await axios.post(`${agentBackendUrl}/api/agents/${deploymentId}/deploy/repconnect1`, {
      source: 'agent-command-center',
      deployment_metadata: {
        internal_id: agentId,
        agent_name: agent.name,
        deployment_timestamp: new Date().toISOString()
      }
    });
    
    // Update local deployment tracking
    await deploymentService.recordDeployment(agentId, 'repconnect1', response.data);
    
    res.json({
      success: true,
      message: `Agent ${agent.name} deployed to RepConnect1`,
      deployment_id: deploymentId,
      data: response.data
    });
  } catch (error) {
    console.error('Error deploying to RepConnect1:', error);
    res.status(500).json({ 
      error: 'Failed to deploy agent to RepConnect1',
      details: error.message 
    });
  }
});

// Get Pedro's agents
router.get('/pedro-agents', async (req, res) => {
  try {
    const pedroBackendUrl = process.env.PEDRO_BACKEND_URL || 'https://pedrobackend.onrender.com';
    
    if (!pedroBackendUrl) {
      throw new Error('PEDRO_BACKEND_URL not configured');
    }
    
    // Fetch agents currently on Pedro platform
    const response = await axios.get(`${pedroBackendUrl}/api/agents`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgentCommandCenter/1.0'
      }
    });
    
    const pedroAgents = Array.isArray(response.data) ? response.data : response.data.agents || [];
    
    // Cross-reference with local database to get additional info
    const enrichedAgents = await enrichAgentsWithLocalData(pedroAgents, 'pedro');
    
    res.json({
      success: true,
      agents: enrichedAgents,
      total: enrichedAgents.length,
      maxAgents: 5,
      source: 'pedro-backend',
      fetched_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Pedro agents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Pedro agents',
      details: error.message 
    });
  }
});

// Get RepConnect1's agents
router.get('/repconnect1-agents', async (req, res) => {
  try {
    const repconnect1BackendUrl = process.env.REPCONNECT1_BACKEND_URL || 'https://osbackend-zl1h.onrender.com';
    
    if (!repconnect1BackendUrl) {
      throw new Error('REPCONNECT1_BACKEND_URL not configured');
    }
    
    // Fetch agents currently on RepConnect1 platform
    const response = await axios.get(`${repconnect1BackendUrl}/api/agents`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgentCommandCenter/1.0'
      }
    });
    
    const repconnect1Agents = Array.isArray(response.data) ? response.data : response.data.agents || [];
    
    // Cross-reference with local database to get additional info
    const enrichedAgents = await enrichAgentsWithLocalData(repconnect1Agents, 'repconnect1');
    
    res.json({
      success: true,
      agents: enrichedAgents,
      total: enrichedAgents.length,
      source: 'repconnect1-backend',
      fetched_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching RepConnect1 agents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch RepConnect1 agents',
      details: error.message 
    });
  }
});

// Enrich platform agents with local database information
const enrichAgentsWithLocalData = async (platformAgents, platform) => {
  const enrichedAgents = [];
  
  for (const platformAgent of platformAgents) {
    const externalId = platformAgent.id || platformAgent._id;
    
    // Try to find matching agent in local database
    const { data: localAgent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('external_id', externalId)
      .single();
    
    if (!error && localAgent) {
      // Merge platform data with local data
      enrichedAgents.push({
        ...platformAgent,
        local_data: {
          id: localAgent.id,
          deployment_info: localAgent.deployment_info,
          last_synced: localAgent.last_synced_at,
          voice_config: localAgent.voice_config,
          knowledge_base: localAgent.knowledge_base
        },
        platform,
        is_synced: true
      });
    } else {
      // Agent exists on platform but not in local database
      enrichedAgents.push({
        ...platformAgent,
        platform,
        is_synced: false,
        sync_note: 'Agent not found in local database'
      });
    }
  }
  
  return enrichedAgents;
};

// Sync status endpoint
router.get('/sync-status', async (req, res) => {
  try {
    // Get recent sync logs
    const { data: syncLogs, error: logsError } = await supabase
      .from('sync_logs')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(10);
    
    // Get agent counts
    const { data: agentCounts, error: countError } = await supabase
      .from('agents')
      .select('external_source, status', { count: 'exact' });
    
    // Get deployment counts by platform
    const { data: deploymentCounts, error: deployError } = await supabase
      .from('agent_deployments')
      .select('platform_id, deployment_status', { count: 'exact' });
    
    res.json({
      success: true,
      sync_logs: syncLogs || [],
      agent_statistics: {
        total_agents: agentCounts?.length || 0,
        by_source: groupBy(agentCounts || [], 'external_source'),
        by_status: groupBy(agentCounts || [], 'status')
      },
      deployment_statistics: {
        total_deployments: deploymentCounts?.length || 0,
        by_status: groupBy(deploymentCounts || [], 'deployment_status')
      },
      last_checked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({
      error: 'Failed to get sync status',
      details: error.message
    });
  }
});

// Helper function to group by property
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key] || 'unknown';
    result[group] = (result[group] || 0) + 1;
    return result;
  }, {});
};

module.exports = router;