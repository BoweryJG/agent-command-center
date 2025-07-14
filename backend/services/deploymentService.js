const axios = require('axios');
const supabase = require('../utils/supabase');

// Platform-specific deployment handlers
const platformHandlers = {
  agentbackend: {
    deploy: async (agent, targetUrl) => {
      // First deploy to central agent backend
      const agentBackendUrl = process.env.AGENT_BACKEND_URL;
      const response = await axios.post(`${agentBackendUrl}/api/agents`, {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        personality: agent.personality,
        capabilities: agent.capabilities,
        voice_config: agent.voice_config,
        knowledge_base: agent.knowledge_base,
        procedures_access: agent.procedures_access,
        source: 'agent-command-center',
        deploy_to: targetUrl === process.env.PEDRO_BACKEND_URL ? 'pedro' : 'repconnect1'
      });
      
      // Then trigger deployment to specific platform
      if (targetUrl === process.env.PEDRO_BACKEND_URL) {
        await axios.post(`${agentBackendUrl}/api/agents/${agent.id}/deploy/pedro`);
      } else if (targetUrl === process.env.REPCONNECT1_BACKEND_URL) {
        await axios.post(`${agentBackendUrl}/api/agents/${agent.id}/deploy/repconnect1`);
      }
      
      return response.data;
    },
    undeploy: async (agentId, targetUrl) => {
      const agentBackendUrl = process.env.AGENT_BACKEND_URL;
      const platform = targetUrl === process.env.PEDRO_BACKEND_URL ? 'pedro' : 'repconnect1';
      const response = await axios.delete(`${agentBackendUrl}/api/agents/${agentId}/deploy/${platform}`);
      return response.data;
    }
  },
  repconnect1: {
    deploy: async (agent, targetUrl) => {
      // Use agent backend to deploy to RepConnect1
      return platformHandlers.agentbackend.deploy(agent, process.env.REPCONNECT1_BACKEND_URL);
    },
    undeploy: async (agentId, targetUrl) => {
      return platformHandlers.agentbackend.undeploy(agentId, process.env.REPCONNECT1_BACKEND_URL);
    }
  },
  pedro: {
    deploy: async (agent, targetUrl) => {
      // Use agent backend to deploy to Pedro
      return platformHandlers.agentbackend.deploy(agent, process.env.PEDRO_BACKEND_URL);
    },
    undeploy: async (agentId, targetUrl) => {
      return platformHandlers.agentbackend.undeploy(agentId, process.env.PEDRO_BACKEND_URL);
    }
  }
};

async function deployAgent(agentId, platformId, targetUrl) {
  try {
    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    
    if (agentError) throw agentError;
    if (!agent) throw new Error('Agent not found');
    
    // Get platform details
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', platformId)
      .single();
    
    if (platformError) throw platformError;
    if (!platform) throw new Error('Platform not found');
    
    // Check if handler exists for this platform
    const handler = platformHandlers[platform.name.toLowerCase()];
    if (!handler) {
      throw new Error(`No deployment handler for platform: ${platform.name}`);
    }
    
    // Deploy to the platform
    const deploymentResult = await handler.deploy(agent, targetUrl);
    
    // Record deployment in database
    const { data: deployment, error: deployError } = await supabase
      .from('agent_deployments')
      .insert([{
        agent_id: agentId,
        platform_id: platformId,
        deployment_url: targetUrl,
        status: 'active',
        deployed_at: new Date().toISOString(),
        deployment_config: {
          targetUrl,
          deploymentResult
        }
      }])
      .select()
      .single();
    
    if (deployError) throw deployError;
    
    return {
      success: true,
      deployment,
      message: `Agent ${agent.name} deployed to ${platform.name}`
    };
  } catch (error) {
    console.error('Deployment error:', error);
    throw error;
  }
}

async function undeployAgent(deploymentId) {
  try {
    // Get deployment details
    const { data: deployment, error: deployError } = await supabase
      .from('agent_deployments')
      .select('*, agents(*), platforms(*)')
      .eq('id', deploymentId)
      .single();
    
    if (deployError) throw deployError;
    if (!deployment) throw new Error('Deployment not found');
    
    const platform = deployment.platforms;
    const handler = platformHandlers[platform.name.toLowerCase()];
    
    if (!handler) {
      throw new Error(`No deployment handler for platform: ${platform.name}`);
    }
    
    // Undeploy from the platform
    await handler.undeploy(deployment.agent_id, deployment.deployment_url);
    
    // Update deployment status
    const { error: updateError } = await supabase
      .from('agent_deployments')
      .update({ 
        status: 'inactive',
        undeployed_at: new Date().toISOString()
      })
      .eq('id', deploymentId);
    
    if (updateError) throw updateError;
    
    return {
      success: true,
      message: `Agent undeployed from ${platform.name}`
    };
  } catch (error) {
    console.error('Undeployment error:', error);
    throw error;
  }
}

async function getDeploymentStatus(deploymentId) {
  try {
    const { data, error } = await supabase
      .from('agent_deployments')
      .select('*, agents(*), platforms(*)')
      .eq('id', deploymentId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Deployment not found');
    
    return data;
  } catch (error) {
    console.error('Get deployment status error:', error);
    throw error;
  }
}

async function getAgentDeployments(agentId) {
  try {
    const { data, error } = await supabase
      .from('agent_deployments')
      .select('*, platforms(*)')
      .eq('agent_id', agentId)
      .order('deployed_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get agent deployments error:', error);
    throw error;
  }
}

async function getAgentDeploymentStatus(agentId) {
  try {
    // Get all deployments for this agent
    const deployments = await getAgentDeployments(agentId);
    
    // Organize by platform
    const statusByPlatform = {};
    
    for (const deployment of deployments) {
      const platform = deployment.platforms?.name || 'unknown';
      
      // Keep only the most recent deployment per platform
      if (!statusByPlatform[platform] || 
          new Date(deployment.deployed_at) > new Date(statusByPlatform[platform].deployed_at)) {
        statusByPlatform[platform] = {
          deployment_id: deployment.id,
          status: deployment.deployment_status || deployment.status,
          deployed_at: deployment.deployed_at,
          activated_at: deployment.activated_at,
          deactivated_at: deployment.deactivated_at,
          version: deployment.version,
          deployment_type: deployment.deployment_type,
          is_active: deployment.deployment_status === 'active' && !deployment.deactivated_at
        };
      }
    }
    
    return {
      agent_id: agentId,
      deployments: statusByPlatform,
      total_deployments: deployments.length,
      active_deployments: Object.values(statusByPlatform).filter(d => d.is_active).length
    };
  } catch (error) {
    console.error('Get agent deployment status error:', error);
    throw error;
  }
}

async function recordDeployment(agentId, platform, deploymentData) {
  try {
    // Get platform ID
    const { data: platformData, error: platformError } = await supabase
      .from('platforms')
      .select('id')
      .eq('name', platform)
      .single();
    
    if (platformError && platformError.code !== 'PGRST116') {
      throw platformError;
    }
    
    // If platform doesn't exist, create it
    let platformId;
    if (!platformData) {
      const { data: newPlatform, error: createError } = await supabase
        .from('platforms')
        .insert({
          name: platform,
          description: `${platform} platform`,
          api_endpoint: getPlatformUrl(platform),
          is_active: true
        })
        .select()
        .single();
      
      if (createError) throw createError;
      platformId = newPlatform.id;
    } else {
      platformId = platformData.id;
    }
    
    // Check for existing active deployment
    const { data: existingDeployment, error: checkError } = await supabase
      .from('agent_deployments')
      .select('id')
      .eq('agent_id', agentId)
      .eq('platform_id', platformId)
      .eq('deployment_status', 'active')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    // Deactivate existing deployment if found
    if (existingDeployment) {
      await supabase
        .from('agent_deployments')
        .update({
          deployment_status: 'inactive',
          deactivated_at: new Date().toISOString()
        })
        .eq('id', existingDeployment.id);
    }
    
    // Record new deployment
    const { data: deployment, error: deployError } = await supabase
      .from('agent_deployments')
      .insert({
        agent_id: agentId,
        platform_id: platformId,
        deployment_type: 'production',
        version: deploymentData.version || '1.0.0',
        deployment_config: deploymentData,
        deployment_url: getPlatformUrl(platform),
        deployment_status: 'active',
        deployed_at: new Date().toISOString(),
        activated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (deployError) throw deployError;
    
    return deployment;
  } catch (error) {
    console.error('Record deployment error:', error);
    throw error;
  }
}

async function checkAgentLiveStatus(agentId, platform) {
  try {
    const platformUrl = getPlatformUrl(platform);
    if (!platformUrl) {
      return {
        is_live: false,
        status: 'platform_not_configured',
        message: `No URL configured for platform: ${platform}`
      };
    }
    
    // Get agent details to use external_id if available
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('external_id')
      .eq('id', agentId)
      .single();
    
    if (agentError) {
      return {
        is_live: false,
        status: 'agent_not_found',
        message: 'Agent not found in database'
      };
    }
    
    const checkId = agent.external_id || agentId;
    
    try {
      const response = await axios.get(`${platformUrl}/api/agents/${checkId}/status`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        return {
          is_live: true,
          status: 'live',
          platform_status: response.data.status || 'active',
          last_active: response.data.last_active_at,
          version: response.data.version,
          metrics: response.data.metrics
        };
      } else if (response.status === 404) {
        return {
          is_live: false,
          status: 'not_found',
          message: 'Agent not found on platform'
        };
      } else {
        return {
          is_live: false,
          status: 'error',
          message: `Unexpected status: ${response.status}`
        };
      }
    } catch (error) {
      // Try alternate endpoint if status endpoint fails
      try {
        const altResponse = await axios.get(`${platformUrl}/api/agents/${checkId}`, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        
        if (altResponse.status === 200) {
          return {
            is_live: true,
            status: 'live',
            platform_status: altResponse.data.status || 'active',
            last_active: altResponse.data.last_active_at,
            version: altResponse.data.version
          };
        }
      } catch (altError) {
        // Both endpoints failed
      }
      
      return {
        is_live: false,
        status: 'unreachable',
        message: error.message
      };
    }
  } catch (error) {
    console.error('Check agent live status error:', error);
    return {
      is_live: false,
      status: 'error',
      message: error.message
    };
  }
}

// Helper function to get platform URL
function getPlatformUrl(platform) {
  const platformUrls = {
    pedro: process.env.PEDRO_BACKEND_URL || 'https://pedrobackend.onrender.com',
    repconnect1: process.env.REPCONNECT1_BACKEND_URL || 'https://osbackend-zl1h.onrender.com',
    'agent-command-center': process.env.AGENT_COMMAND_CENTER_URL || process.env.BACKEND_URL,
    agentbackend: process.env.AGENT_BACKEND_URL || 'https://agentbackend-2932.onrender.com'
  };
  
  return platformUrls[platform.toLowerCase()];
}

// Check if agent is ready for deployment
async function isAgentReady(agentId) {
  try {
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();
    
    if (error) throw error;
    if (!agent) return { ready: false, reason: 'Agent not found' };
    
    // Check required fields
    const requiredFields = ['name', 'type', 'config'];
    const missingFields = requiredFields.filter(field => !agent[field]);
    
    if (missingFields.length > 0) {
      return {
        ready: false,
        reason: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    
    // Check if agent is active
    if (!agent.is_active) {
      return {
        ready: false,
        reason: 'Agent is not active'
      };
    }
    
    // Check if agent has proper configuration
    if (!agent.config.model) {
      return {
        ready: false,
        reason: 'Agent missing model configuration'
      };
    }
    
    return {
      ready: true,
      agent_name: agent.name,
      agent_type: agent.type
    };
  } catch (error) {
    console.error('Check agent ready error:', error);
    return {
      ready: false,
      reason: error.message
    };
  }
}

module.exports = {
  deployAgent,
  undeployAgent,
  getDeploymentStatus,
  getAgentDeployments,
  getAgentDeploymentStatus,
  recordDeployment,
  checkAgentLiveStatus,
  isAgentReady,
  getPlatformUrl
};