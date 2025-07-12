const axios = require('axios');
const supabase = require('../utils/supabase');

// Platform-specific deployment handlers
const platformHandlers = {
  repconnect1: {
    deploy: async (agent, targetUrl) => {
      // Deploy to repconnect1 backend
      const response = await axios.post(`${targetUrl}/api/agents/receive`, {
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          personality: agent.personality,
          capabilities: agent.capabilities,
          voice_config: agent.voice_config,
          knowledge_base: agent.knowledge_base,
          procedures_access: agent.procedures_access
        },
        source: 'agent-command-center'
      });
      return response.data;
    },
    undeploy: async (agentId, targetUrl) => {
      const response = await axios.delete(`${targetUrl}/api/agents/${agentId}`);
      return response.data;
    }
  },
  pedro: {
    deploy: async (agent, targetUrl) => {
      // Deploy to pedro backend - check 5 agent limit
      const existingAgents = await axios.get(`${targetUrl}/api/agents`);
      if (existingAgents.data.length >= 5) {
        throw new Error('Pedro platform is limited to 5 agents maximum');
      }
      
      const response = await axios.post(`${targetUrl}/api/agents/receive`, {
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          personality: agent.personality,
          capabilities: agent.capabilities,
          voice_config: agent.voice_config,
          knowledge_base: agent.knowledge_base,
          procedures_access: agent.procedures_access
        },
        source: 'agent-command-center'
      });
      return response.data;
    },
    undeploy: async (agentId, targetUrl) => {
      const response = await axios.delete(`${targetUrl}/api/agents/${agentId}`);
      return response.data;
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

module.exports = {
  deployAgent,
  undeployAgent,
  getDeploymentStatus,
  getAgentDeployments
};