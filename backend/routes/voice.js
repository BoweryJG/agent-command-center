const express = require('express');
const router = express.Router();

// Mock voice data
const mockVoices = {
  harvey: {
    id: 'harvey',
    name: 'Harvey',
    description: 'Deep, authoritative voice',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  samantha: {
    id: 'samantha',
    name: 'Samantha',
    description: 'Warm, friendly voice',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    description: 'Professional, clear voice',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
};

// Get all voices
router.get('/', (req, res) => {
  res.json(Object.values(mockVoices));
});

// Get specific voice
router.get('/:id', (req, res) => {
  const voice = mockVoices[req.params.id];
  if (!voice) {
    return res.status(404).json({ error: 'Voice not found' });
  }
  res.json(voice);
});

// Generate voice preview (mock)
router.post('/generate', async (req, res) => {
  const { text, voiceId } = req.body;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock audio URL
  res.json({
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 3.5,
    text,
    voiceId
  });
});

// Clone voice (mock)
router.post('/clone', async (req, res) => {
  const { audioFile, voiceName } = req.body;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock cloned voice data
  res.json({
    voiceId: `cloned-${Date.now()}`,
    name: voiceName,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    status: 'completed'
  });
});

module.exports = router;