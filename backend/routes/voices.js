const express = require('express');
const router = express.Router();
const axios = require('axios');
const supabase = require('../utils/supabase');

// Proxy voice preview to deployed platform
router.post('/preview', async (req, res, next) => {
  try {
    const { voiceId, text, settings } = req.body;
    
    // Extract agent ID from voiceId (assuming format: "agentId-voice")
    const agentId = voiceId.replace('-voice', '');
    
    // Find where this agent is deployed
    const { data: deployment, error } = await supabase
      .from('agent_deployments')
      .select('*, platforms(*)')
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single();
    
    if (error || !deployment) {
      // Fallback to agentbackend if not deployed
      try {
        const response = await axios.post(
          `${process.env.AGENT_BACKEND_URL}/api/voices/preview`,
          req.body,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
          }
        );
        
        res.set({
          'Content-Type': response.headers['content-type'],
          'Content-Length': response.headers['content-length']
        });
        
        res.send(response.data);
        return;
      } catch (fallbackError) {
        return res.status(404).json({
          success: false,
          error: 'Voice preview not available'
        });
      }
    }
    
    // Forward request to the deployed platform
    const platformUrl = deployment.deployment_url;
    const response = await axios.post(
      `${platformUrl}/api/voices/preview`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );
    
    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length']
    });
    
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying voice preview:', error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

// Get available voices
router.get('/', async (req, res, next) => {
  try {
    // Get all deployed agents with voice capabilities
    const { data: deployments, error } = await supabase
      .from('agent_deployments')
      .select('*, agents(*)')
      .eq('status', 'active');
    
    if (error) throw error;
    
    const voices = deployments
      .filter(d => d.agents.voice_config?.enabled)
      .map(d => ({
        id: `${d.agents.id}-voice`,
        name: d.agents.name,
        language: d.agents.language || 'en',
        voiceConfig: d.agents.voice_config,
        platform: d.platforms?.name
      }));
    
    res.json({
      success: true,
      voices
    });
  } catch (error) {
    console.error('Error listing voices:', error);
    next(error);
  }
});

module.exports = router;