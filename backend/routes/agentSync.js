const express = require('express');
const axios = require('axios');
const router = express.Router();

// Sync agents from agent backend to show available agents
router.get('/sync-from-backend', async (req, res) => {
  try {
    const agentBackendUrl = process.env.AGENT_BACKEND_URL;
    
    // Fetch all agents from agent backend
    const response = await axios.get(`${agentBackendUrl}/api/agents`);
    const agents = response.data;
    
    // Filter agents by platform if specified
    const platform = req.query.platform; // 'pedro' or 'repconnect1'
    let filteredAgents = agents;
    
    if (platform === 'pedro') {
      // Get agents deployed to Pedro
      filteredAgents = agents.filter(agent => 
        agent.deployed_to?.includes('pedro') || agent.platforms?.includes('pedro')
      );
    } else if (platform === 'repconnect1') {
      // Get agents deployed to RepConnect1
      filteredAgents = agents.filter(agent => 
        agent.deployed_to?.includes('repconnect1') || agent.platforms?.includes('repconnect1')
      );
    }
    
    res.json({
      success: true,
      agents: filteredAgents,
      total: filteredAgents.length,
      source: 'agent-backend'
    });
  } catch (error) {
    console.error('Error syncing agents from backend:', error);
    res.status(500).json({ 
      error: 'Failed to sync agents from backend',
      details: error.message 
    });
  }
});

// Deploy specific agent to Pedro
router.post('/deploy-to-pedro/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agentBackendUrl = process.env.AGENT_BACKEND_URL;
    
    // Trigger deployment to Pedro via agent backend
    const response = await axios.post(`${agentBackendUrl}/api/agents/${agentId}/deploy/pedro`);
    
    res.json({
      success: true,
      message: `Agent ${agentId} deployed to Pedro`,
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
    const agentBackendUrl = process.env.AGENT_BACKEND_URL;
    
    // Trigger deployment to RepConnect1 via agent backend
    const response = await axios.post(`${agentBackendUrl}/api/agents/${agentId}/deploy/repconnect1`);
    
    res.json({
      success: true,
      message: `Agent ${agentId} deployed to RepConnect1`,
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
    const pedroBackendUrl = process.env.PEDRO_BACKEND_URL;
    
    // Fetch agents currently on Pedro platform
    const response = await axios.get(`${pedroBackendUrl}/api/agents`);
    
    res.json({
      success: true,
      agents: response.data,
      total: response.data.length,
      maxAgents: 5,
      source: 'pedro-backend'
    });
  } catch (error) {
    console.error('Error fetching Pedro agents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Pedro agents',
      details: error.message 
    });
  }
});

module.exports = router;