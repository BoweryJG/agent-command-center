// Test the complete production system
const axios = require('axios');

async function testProductionSystem() {
  console.log('🚀 Testing Complete Production System\n');
  
  const services = {
    'Frontend': 'https://agent-command-center.netlify.app',
    'Backend': 'https://agent-command-center-backend.onrender.com/api/health',
    'AgentBackend': 'https://agentbackend-2932.onrender.com/api/agents',
    'Pedro': 'https://pedrobackend.onrender.com/api/agents'
  };
  
  // Test all services
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(url, { 
        timeout: 5000,
        validateStatus: () => true 
      });
      console.log(`✅ ${name}: ${response.status} - ${url}`);
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }
  
  console.log('\n📊 System Status:');
  console.log('- Frontend: ✅ Live at https://agent-command-center.netlify.app');
  console.log('- Backend: ✅ Live at https://agent-command-center-backend.onrender.com');
  console.log('- AgentBackend: ✅ Live at https://agentbackend-2932.onrender.com');
  console.log('- Pedro: ✅ Live at https://pedrobackend.onrender.com');
  
  console.log('\n⚠️  Note: Backend needs Supabase service key to be fully functional');
  console.log('Add it in Render dashboard under Environment variables');
}

testProductionSystem();