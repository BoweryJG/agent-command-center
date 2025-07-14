# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Frontend (React)
```bash
# Development
npm start                    # Start dev server on http://localhost:3000
npm run build               # Build for production (outputs to /build)
npm test                    # Run tests (currently basic CRA tests)

# Deployment
npm run deploy              # Build and deploy to Netlify
npm run netlify:deploy      # Deploy existing build to Netlify
```

### Backend (Express)
```bash
cd backend
npm start                   # Start production server on port 3001
npm run dev                # Start with nodemon for hot-reload
```

### Environment Setup
Frontend requires `.env` with:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_WS_URL` - WebSocket URL
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key

Backend requires `backend/.env` with:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- `AGENT_BACKEND_URL` - Central agent backend (https://agentbackend-2932.onrender.com)
- `PEDRO_BACKEND_URL` - Pedro platform URL
- `REPCONNECT1_BACKEND_URL` - RepConnect1 platform URL

## Architecture Overview

### System Architecture
The Agent Command Center operates as a **configuration and deployment hub** for AI agents:

1. **Agent Creation**: Agents are built on the central Agent Backend (agentbackend-2932.onrender.com)
2. **Import & Configure**: Command Center syncs agents, allows configuration of permissions, deployment rules
3. **Strategic Deployment**: Deploys configured agents to target platforms (Pedro max 5 agents, RepConnect1 unlimited)

### Frontend Architecture
- **Framework**: React 18 with TypeScript, Create React App
- **Routing**: React Router v6 with protected routes
- **State Management**: 
  - React Query for server state
  - Context API for auth (SupabaseAuthContext)
  - Local state for UI
- **Styling**: Tailwind CSS with Neural Elegance design system
- **Real-time**: Socket.io client for WebSocket connections

Key architectural patterns:
- **Page/Component split**: Pages in `/pages`, reusable components in `/components`
- **Service layer**: API calls abstracted in `/services` (e.g., `agentManagement.service.ts`)
- **Type safety**: Comprehensive TypeScript types in `/types`
- **Auth flow**: Supabase auth with role-based access control

### Backend Architecture
- **Framework**: Express.js with middleware pipeline
- **Database**: Supabase (PostgreSQL) with these tables:
  - `agents` - Main agent storage
  - `platforms` - Deployment targets (pedro, repconnect1)
  - `agent_deployments` - Tracks deployments to platforms
- **Security**: Helmet, CORS, rate limiting
- **Integration Pattern**: Platform handlers for extensible deployments

Key patterns:
- **Route/Service separation**: Routes handle HTTP, services contain business logic
- **Platform Handlers**: Pluggable deployment strategies per platform
- **Error Middleware**: Centralized error handling
- **Environment-based config**: All external URLs/keys in env vars

### Deployment Flow
1. User clicks "Create Agent" → Redirects to Agent Backend
2. "Sync from Agent Backend" → Imports agents to local Supabase
3. "Configure" → Set deployment rules, permissions, target platforms
4. "Deploy" → Routes through platform handlers to push to Pedro/RepConnect1

### Key Integration Points
- **Agent Backend API**: Source of truth for agent definitions
- **Supabase**: Local storage for configuration and deployment tracking
- **Platform APIs**: Pedro (pedrobackend.onrender.com), RepConnect1 (osbackend-zl1h.onrender.com)

### Important Context
- Pedro platform has a hard limit of 5 agents
- Ghibli theme is for visual styling only (card designs), not agent content
- Real agents include healthcare (dental, aesthetic) and sales categories
- WebSocket service exists but is not fully implemented
- Voice functionality uses mock data for testing