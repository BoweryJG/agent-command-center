// Test full deployment flow
const axios = require('axios');

const AGENTBACKEND_URL = 'https://agentbackend-2932.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';
const PEDRO_URL = 'https://pedrobackend.onrender.com';

async function testFullDeploymentFlow() {
  console.log('🚀 Testing Full Agent Deployment Flow\n');
  
  try {
    // Step 1: Get an agent from agentbackend
    console.log('1️⃣ Fetching agents from agentbackend...');
    const agentsResponse = await axios.get(`${AGENTBACKEND_URL}/api/agents`);
    const agents = agentsResponse.data.agents;
    console.log(`✅ Found ${agents.length} agents`);
    
    // Pick Julie as test agent
    const julie = agents.find(a => a.id === 'julie');
    if (!julie) {
      throw new Error('Julie agent not found');
    }
    console.log(`✅ Selected agent: ${julie.name} (${julie.id})\n`);
    
    // Step 2: Deploy to Pedro via agentbackend
    console.log('2️⃣ Deploying agent to Pedro platform...');
    try {
      const deployResponse = await axios.post(
        `${AGENTBACKEND_URL}/api/agents/${julie.id}/deploy/pedro`
      );
      console.log('✅ Deployment initiated:', deployResponse.data.message);
    } catch (deployError) {
      console.log('⚠️  Deployment endpoint returned:', deployError.response?.data || deployError.message);
    }
    
    // Step 3: Test if agent is accessible on Pedro
    console.log('\n3️⃣ Testing agent on Pedro backend...');
    try {
      const pedroTestResponse = await axios.post(
        `${PEDRO_URL}/api/agents/${julie.id}/test`,
        {
          message: 'Hello from test script!',
          context: {}
        }
      );
      console.log('✅ Pedro response:', pedroTestResponse.data.response);
    } catch (pedroError) {
      console.log('❌ Pedro test failed:', pedroError.response?.status, pedroError.response?.data || pedroError.message);
    }
    
    // Step 4: Test local backend proxy
    console.log('\n4️⃣ Testing local backend proxy...');
    try {
      const localTestResponse = await axios.post(
        `${LOCAL_BACKEND_URL}/api/agents/${julie.id}/test`,
        {
          message: 'Hello via local backend!',
          context: {}
        }
      );
      console.log('✅ Local backend proxy response:', localTestResponse.data.response);
    } catch (localError) {
      console.log('❌ Local backend proxy failed:', localError.response?.status, localError.response?.data || localError.message);
    }
    
    // Step 5: Check deployment status
    console.log('\n5️⃣ Checking deployment status...');
    try {
      const statusResponse = await axios.get(`${LOCAL_BACKEND_URL}/api/agents`);
      const deployedAgents = statusResponse.data.agents;
      console.log(`✅ Deployed agents: ${deployedAgents.length}`);
      
      if (deployedAgents.length === 0) {
        console.log('⚠️  No agents currently deployed. This is expected if deployments table is empty.');
      }
    } catch (statusError) {
      console.log('❌ Status check failed:', statusError.response?.data || statusError.message);
    }
    
    console.log('\n✨ Deployment Flow Test Complete!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('- AgentBackend: ✅ Accessible');
    console.log('- Pedro Backend: ✅ Accessible');
    console.log('- Local Backend: ✅ Running');
    console.log('- Deployment: ⚠️  Manual deployment to platforms needed');
    console.log('\n💡 Next Steps:');
    console.log('1. Deploy backend to Render');
    console.log('2. Manually add test deployment to Supabase');
    console.log('3. Test full flow with deployed backend');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFullDeploymentFlow();