# Agent Command Center 🎯

A sophisticated AI agent management platform that serves as the central hub for configuring and deploying AI agents across multiple client platforms. Built with React, TypeScript, and Express.js, featuring a stunning Neural Elegance design system.

![Agent Command Center](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## 🌟 Overview

Agent Command Center is your mission control for AI agent deployment. Build agents on the central Agent Backend, import them here for configuration, and strategically deploy them to client platforms like Pedro and RepConnect1.

### Key Features

- **🤖 Agent Management**: Import, configure, and deploy AI agents
- **🎙️ Voice Studio**: Design and test custom voice profiles
- **🧬 Personality Forge**: Craft unique AI personalities
- **🎓 Agent Academy**: Advanced training modules (Admin only)
- **⚡ Quick Clips**: Pre-built conversation snippets
- **📊 Real-time Analytics**: Monitor agent performance
- **🔐 Role-based Access**: Secure multi-user environment
- **🎨 Neural Elegance UI**: Beautiful dark theme with gradient accents

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account (for database)
- Access to Agent Backend (https://agentbackend-2932.onrender.com)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/agent-command-center.git
cd agent-command-center
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

3. **Environment Configuration**

Create `.env` in the root directory:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `backend/.env`:
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
ALLOWED_ORIGINS=http://localhost:3000
AGENT_BACKEND_URL=https://agentbackend-2932.onrender.com
PEDRO_BACKEND_URL=https://pedrobackend.onrender.com
REPCONNECT1_BACKEND_URL=https://osbackend-zl1h.onrender.com
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm start
```

Visit http://localhost:3000 to see the application.

## 📋 Database Setup

The application uses Supabase PostgreSQL. Required tables:

### agents
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'inactive',
  personality_traits TEXT[],
  voice_config JSONB,
  capabilities JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### platforms
```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  api_endpoint TEXT,
  settings JSONB
);
```

### agent_deployments
```sql
CREATE TABLE agent_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  platform_id UUID REFERENCES platforms(id),
  status VARCHAR DEFAULT 'pending',
  deployed_at TIMESTAMPTZ
);
```

## 🏗️ Architecture

### System Flow
```
Agent Backend → Command Center → Client Platforms
     ↓               ↓                  ↓
Create Agents → Configure/Import → Deploy to Pedro/RepConnect1
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS (Neural Elegance theme)
- React Router v6
- React Query
- Framer Motion
- Socket.io Client
- Supabase Auth

**Backend:**
- Express.js
- Supabase (PostgreSQL)
- Helmet (Security)
- CORS
- Rate Limiting

## 📱 Features Guide

### Dashboard
Central hub showing agent statistics, recent deployments, and system health.

### Agent Management
1. **Create**: Click "Create Agent" → Redirects to Agent Backend
2. **Import**: "Sync from Agent Backend" → Imports available agents
3. **Configure**: Set permissions, deployment rules, target platforms
4. **Deploy**: Choose platform (Pedro max 5 agents, RepConnect1 unlimited)

### Voice Studio
- Upload voice samples
- Configure voice settings (stability, similarity boost)
- Test voice generation
- Compare original vs. cloned voices

### Personality Forge
- Define personality traits
- Set communication style
- Configure response patterns
- Test personality interactions

### Platform Limits
- **Pedro**: Maximum 5 agents (healthcare focused)
- **RepConnect1**: Unlimited agents (sales focused)

## 🔧 Development

### Available Scripts

**Frontend:**
```bash
npm start         # Development server
npm run build     # Production build
npm test          # Run tests
npm run deploy    # Deploy to Netlify
```

**Backend:**
```bash
npm start         # Production server
npm run dev       # Development with nodemon
```

### Project Structure
```
agent-command-center/
├── src/                    # Frontend source
│   ├── components/        # Reusable components
│   ├── pages/            # Route pages
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── backend/               # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── public/               # Static assets
└── build/                # Production build
```

## 🚢 Deployment

### Frontend (Netlify)
```bash
npm run build
npm run netlify:deploy
```

### Backend (Render/Heroku)
Push to main branch with proper environment variables configured.

### Environment Variables (Production)
Update `.env` files with production URLs and keys.

## 🔐 Security

- Supabase Row Level Security (RLS) enabled
- JWT-based authentication
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Rate limiting on API endpoints
- CORS configured for allowed origins

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Core Endpoints

#### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### Deployments
- `POST /api/deployments` - Deploy agent
- `DELETE /api/deployments/:id` - Undeploy agent
- `GET /api/deployments/agent/:agentId` - Get agent deployments

#### Agent Sync
- `GET /api/agent-sync/sync-from-backend` - Sync from Agent Backend
- `POST /api/agent-sync/deploy-to-pedro/:agentId` - Deploy to Pedro
- `POST /api/agent-sync/deploy-to-repconnect1/:agentId` - Deploy to RepConnect1
- `GET /api/agent-sync/pedro-agents` - List Pedro's agents

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
- Ensure all dependencies are installed: `npm install`
- Check TypeScript version compatibility

**Cannot connect to backend**
- Verify backend is running on port 3001
- Check CORS configuration in backend/.env

**Supabase connection errors**
- Verify Supabase URL and keys
- Check Row Level Security policies

**Agent sync not working**
- Ensure Agent Backend is accessible
- Check network/firewall settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Create React App
- UI design inspired by Neural Elegance principles
- Agent Backend integration for centralized agent management
- Supabase for real-time database capabilities

## 📞 Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/yourusername/agent-command-center/issues) page.

---

Built with ❤️ by the Agent Command Center Team