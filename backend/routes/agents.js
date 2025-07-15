const express = require('express');
const router = express.Router();
const axios = require('axios');
const supabase = require('../utils/supabase');

// Proxy test request to deployed platform
router.post('/:id/test', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find where this agent is deployed
    const { data: deployment, error } = await supabase
      .from('agent_deployments')
      .select('*, platforms(*)')
      .eq('agent_id', id)
      .eq('status', 'active')
      .single();
    
    if (error || !deployment) {
      return res.status(404).json({
        success: false,
        error: 'Agent not deployed or not found'
      });
    }
    
    // Forward request to the deployed platform
    const platformUrl = deployment.deployment_url;
    const response = await axios.post(
      `${platformUrl}/api/agents/${id}/test`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying test request:', error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// Proxy interact request to deployed platform
router.post('/:id/interact', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find where this agent is deployed
    const { data: deployment, error } = await supabase
      .from('agent_deployments')
      .select('*, platforms(*)')
      .eq('agent_id', id)
      .eq('status', 'active')
      .single();
    
    if (error || !deployment) {
      return res.status(404).json({
        success: false,
        error: 'Agent not deployed or not found'
      });
    }
    
    // Forward request to the deployed platform
    const platformUrl = deployment.deployment_url;
    const response = await axios.post(
      `${platformUrl}/api/agents/${id}/interact`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying interact request:', error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// Get agent info (from deployment)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find where this agent is deployed
    const { data: deployment, error } = await supabase
      .from('agent_deployments')
      .select('*, agents(*), platforms(*)')
      .eq('agent_id', id)
      .eq('status', 'active')
      .single();
    
    if (error || !deployment) {
      return res.status(404).json({
        success: false,
        error: 'Agent not deployed or not found'
      });
    }
    
    // Return agent info with deployment status
    res.json({
      success: true,
      agent: deployment.agents,
      deployment: {
        platform: deployment.platforms.name,
        url: deployment.deployment_url,
        status: deployment.status,
        deployedAt: deployment.deployed_at
      }
    });
  } catch (error) {
    console.error('Error getting agent info:', error);
    next(error);
  }
});

// List all deployed agents
router.get('/', async (req, res, next) => {
  try {
    const { data: deployments, error } = await supabase
      .from('agent_deployments')
      .select('*, agents(*), platforms(*)')
      .eq('status', 'active');
    
    if (error) throw error;
    
    const agents = deployments.map(d => ({
      ...d.agents,
      deployment: {
        platform: d.platforms.name,
        url: d.deployment_url,
        deployedAt: d.deployed_at
      }
    }));
    
    res.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    next(error);
  }
});

module.exports = router;