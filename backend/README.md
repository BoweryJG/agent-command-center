# Agent Command Center Backend

This is the backend service for the Agent Command Center, providing comprehensive APIs for agent management, synchronization, deployment tracking, and voice services.

## Features

- **Agent Synchronization**: Sync agents from external backends with proper data mapping
- **Deployment Management**: Track and manage agent deployments across multiple platforms
- **Live Status Monitoring**: Check if agents are actively deployed and running
- **Voice Services**: Manage agent voice configurations
- **External ID Tracking**: Maintain relationships between local and external agent IDs
- **Sync Status Tracking**: Monitor synchronization operations and history
- **Platform-specific constraints**: (e.g., Pedro 5-agent limit)

## API Endpoints

### Agent Management (`/api/agents`)
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Agent Synchronization (`/api/agent-sync`)

#### Sync Agents from External Backend
```
GET /api/agent-sync/sync-from-backend?platform=pedro&save=true
```
- Fetches agents from agentbackend-2932.onrender.com
- Maps external data structure to local format
- Optional `platform` filter: `pedro`, `repconnect1`, `agent-command-center`
- Optional `save=true` to persist to local database
- Tracks sync status and timestamps

#### Check Deployment Status
```
GET /api/agent-sync/check-deployment-status/:agentId
```
- Returns deployment status across all platforms
- Shows live/ready status for each platform
- Includes last seen timestamps and versions

#### Deploy to Platforms
```
POST /api/agent-sync/deploy-to-pedro/:agentId
POST /api/agent-sync/deploy-to-repconnect1/:agentId
```
- Deploys agent to specific platform
- Uses external_id for deployment
- Records deployment in local database

#### Get Platform Agents
```
GET /api/agent-sync/pedro-agents
GET /api/agent-sync/repconnect1-agents
```
- Fetches agents currently deployed on specific platforms
- Cross-references with local database
- Shows sync status for each agent

#### Sync Status
```
GET /api/agent-sync/sync-status
```
- Returns recent sync logs
- Shows agent statistics by source and status
- Displays deployment statistics

### Deployments (`/api/deployments`)
- `POST /api/deployments/deploy` - Deploy agent to platform
- `POST /api/deployments/undeploy` - Remove agent from platform
- `GET /api/deployments/status/:deploymentId` - Get deployment status
- `GET /api/deployments/agent/:agentId` - Get all deployments for an agent

### Voice Services (`/api/voice`)
- Voice configuration and management endpoints

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Platform URLs
AGENT_BACKEND_URL=https://agentbackend-2932.onrender.com
REPCONNECT1_BACKEND_URL=https://osbackend-zl1h.onrender.com
PEDRO_BACKEND_URL=https://pedrobackend.onrender.com
AGENT_COMMAND_CENTER_URL=https://agent-command-center-backend.onrender.com

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://agent-command-center.netlify.app
```

## Database Schema

### agents table
- `id`: UUID primary key
- `external_id`: ID in external system
- `external_source`: Source system (e.g., 'agentbackend-2932')
- `name`, `description`, `type`: Basic agent info
- `config`: Agent configuration (model, temperature, etc.)
- `capabilities`: Array of agent capabilities
- `personality_traits`: Personality configuration
- `voice_config`: Voice provider and settings
- `knowledge_base`: Knowledge base configuration
- `procedures_access`: Array of accessible procedures
- `deployment_info`: Current deployment status
- `last_synced_at`: Last sync timestamp

### sync_logs table
- `id`: UUID primary key
- `operation`: Type of sync operation
- `status`: success/failed/partial
- `details`: Operation details (JSON)
- `synced_at`: Timestamp

### agent_deployments table
- Links agents to platforms
- Tracks deployment status and timestamps
- Stores deployment configuration

## Data Mapping

The sync service maps external agent data to local format:

```javascript
{
  external_id: agent.id || agent._id,
  external_source: 'agentbackend-2932',
  name: agent.name || agent.agentName,
  type: mapAgentType(agent.type),
  config: {
    model: agent.model,
    temperature: agent.temperature,
    max_tokens: agent.max_tokens
  },
  capabilities: agent.capabilities || agent.skills,
  voice_config: agent.voice_config || {
    provider: agent.voiceProvider,
    voice_id: agent.voiceId
  },
  deployment_info: {
    deployed_to: agent.deployed_to || agent.platforms,
    deployment_status: agent.deployment_status
  }
}
```

## Platform Integration

The backend supports deployment to:
- **repconnect1**: Sales-focused agents
- **pedro**: Patient-focused agents (limited to 5)
- **agent-command-center**: Central management platform

Each platform has its own backend and deployment APIs.

## Error Handling

All endpoints include comprehensive error handling:
- Timeout protection (30s for external requests)
- Graceful fallbacks for missing data
- Detailed error messages in responses
- Sync operation logging for debugging

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`

3. Run database migrations:
```sql
-- Run migrations in order:
-- 001_create_agent_tables.sql
-- 002_initial_data.sql
-- 003_add_agent_sync_columns.sql
```

4. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Testing

Test the sync endpoint:
```bash
curl http://localhost:3001/api/agent-sync/sync-from-backend?save=true
```

Check deployment status:
```bash
curl http://localhost:3001/api/agent-sync/check-deployment-status/[agent-id]
```

## Deployment Service Methods

The deployment service (`services/deploymentService.js`) provides:

- `deployAgent(agentId, platformId, targetUrl)`: Deploy an agent to a platform
- `undeployAgent(deploymentId)`: Remove an agent from a platform
- `getDeploymentStatus(deploymentId)`: Get status of a specific deployment
- `getAgentDeployments(agentId)`: Get all deployments for an agent
- `getAgentDeploymentStatus(agentId)`: Get deployment status summary
- `recordDeployment(agentId, platform, data)`: Record a new deployment
- `checkAgentLiveStatus(agentId, platform)`: Check if agent is live on platform
- `isAgentReady(agentId)`: Check if agent is ready for deployment