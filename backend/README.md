# Agent Command Center Backend

Backend service for the Agent Command Center - a unified hub for managing AI agents across multiple platforms.

## Features

- Deploy agents to multiple platforms (repconnect1, pedro)
- Manage agent configurations
- Track deployment status
- Platform-specific constraints (e.g., Pedro 5-agent limit)
- RESTful API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`

3. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Deployments
- `POST /api/deployments/deploy` - Deploy agent to platform
- `POST /api/deployments/undeploy` - Remove agent from platform
- `GET /api/deployments/status/:deploymentId` - Get deployment status
- `GET /api/deployments/agent/:agentId` - Get all deployments for an agent

## Platform Integration

The backend supports deployment to:
- **repconnect1**: Sales-focused agents
- **pedro**: Patient-focused agents (limited to 5)

Each platform has its own backend and receives agents via POST to `/api/agents/receive`.