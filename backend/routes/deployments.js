const express = require('express');
const router = express.Router();
const { deployAgent, undeployAgent, getDeploymentStatus, getAgentDeployments } = require('../services/deploymentService');

// Deploy an agent to a specific platform
router.post('/deploy', async (req, res, next) => {
  try {
    const { agentId, platformId, targetUrl } = req.body;
    
    if (!agentId || !platformId || !targetUrl) {
      return res.status(400).json({
        error: { message: 'Missing required fields: agentId, platformId, targetUrl' }
      });
    }
    
    const result = await deployAgent(agentId, platformId, targetUrl);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Undeploy an agent from a platform
router.post('/undeploy', async (req, res, next) => {
  try {
    const { deploymentId } = req.body;
    
    if (!deploymentId) {
      return res.status(400).json({
        error: { message: 'Missing required field: deploymentId' }
      });
    }
    
    const result = await undeployAgent(deploymentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get deployment status
router.get('/status/:deploymentId', async (req, res, next) => {
  try {
    const { deploymentId } = req.params;
    const status = await getDeploymentStatus(deploymentId);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// Get all deployments for an agent
router.get('/agent/:agentId', async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const deployments = await getAgentDeployments(agentId);
    res.json(deployments);
  } catch (error) {
    next(error);
  }
});

// Test deployment endpoint
router.post('/test-deployment', async (req, res, next) => {
  try {
    const { agentId, platformId, targetUrl } = req.body;
    
    console.log('Test deployment request:', { agentId, platformId, targetUrl });
    
    // For testing, just acknowledge the request
    res.json({
      success: true,
      message: 'Test deployment initiated',
      deployment: {
        agentId,
        platformId,
        targetUrl,
        status: 'test-success',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;