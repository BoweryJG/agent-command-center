const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// Get all agents
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('agents')
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
      .from('agents')
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
    const requiredFields = ['name', 'type', 'personality', 'capabilities'];
    for (const field of requiredFields) {
      if (!agentData[field]) {
        return res.status(400).json({
          error: { message: `Missing required field: ${field}` }
        });
      }
    }
    
    const { data, error } = await supabase
      .from('agents')
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
      .from('agents')
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
      .from('agents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;