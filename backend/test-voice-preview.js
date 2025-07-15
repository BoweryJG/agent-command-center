const axios = require('axios');

// Test the voice preview endpoint
async function testVoicePreview() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('Testing POST /api/voices/preview...');
    
    // Test with valid data
    const response = await axios.post(`${baseUrl}/api/voices/preview`, {
      text: 'Hello, this is a test of the voice preview system.',
      voiceId: 'harvey',
      settings: {
        speed: 1.0,
        pitch: 1.0
      }
    });
    
    console.log('✅ Success:', response.data);
    
    // Test with missing parameters
    try {
      await axios.post(`${baseUrl}/api/voices/preview`, {
        text: 'Missing voiceId'
      });
    } catch (error) {
      console.log('✅ Correctly handled missing parameter:', error.response.data);
    }
    
    // Test with invalid voiceId
    try {
      await axios.post(`${baseUrl}/api/voices/preview`, {
        text: 'Invalid voice test',
        voiceId: 'invalid-voice'
      });
    } catch (error) {
      console.log('✅ Correctly handled invalid voiceId:', error.response.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testVoicePreview();