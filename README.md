# Agent Command Center 🎯

A sophisticated AI agent management platform that serves as the central hub for configuring and deploying AI agents across multiple client platforms. Built with React, TypeScript, and Express.js, featuring a stunning Neural Elegance design system.

![Agent Command Center](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)

## 🌟 Overview

Agent Command Center is your mission control for AI agent deployment. Build agents on the central Agent Backend, import them here for configuration, and strategically deploy them to client platforms like Pedro and RepConnect1.

### Key Features

- **🤖 Agent Management**: Import, configure, test, and deploy AI agents
- **🎙️ Voice Studio**: Design and test custom voice profiles with real-time preview
- **🧬 Personality Forge**: Craft unique AI personalities with traits and behaviors
- **💬 Interactive Testing**: Real-time chat interface to test agent responses
- **🎓 Agent Academy**: Advanced training modules (Admin only)
- **⚡ Quick Clips**: Pre-built conversation snippets for rapid deployment
- **📊 Real-time Analytics**: Monitor agent performance with live metrics
- **🔐 Role-based Access**: Secure multi-user environment with granular permissions
- **🎨 Neural Elegance UI**: Beautiful dark theme with gradient accents
- **🔄 WebSocket Support**: Real-time updates with automatic REST fallback
- **🚀 Multi-platform Deployment**: Deploy to Pedro, RepConnect1, and custom platforms
- **📈 Performance Monitoring**: Track response times, success rates, and user sentiment

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
# API Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_ENVIRONMENT=development

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags (optional)
REACT_APP_ENABLE_VOICE=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_WEBSOCKET=true
```

Create `backend/.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000

# External Services
AGENT_BACKEND_URL=https://agentbackend-2932.onrender.com
PEDRO_BACKEND_URL=https://pedrobackend.onrender.com
REPCONNECT1_BACKEND_URL=https://osbackend-zl1h.onrender.com

# Optional Services
ELEVENLABS_API_KEY=your_elevenlabs_key # For voice generation
OPENAI_API_KEY=your_openai_key # For AI features
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
- `GET /api/agents/:id` - Get specific agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/test` - Test agent with sample query
- `POST /api/agents/:id/interact` - Interactive chat with agent

#### Deployments
- `POST /api/deployments` - Deploy agent
- `DELETE /api/deployments/:id` - Undeploy agent
- `GET /api/deployments/agent/:agentId` - Get agent deployments
- `GET /api/deployments/status/:agentId/:platformId` - Check deployment status

#### Voice
- `GET /api/voice` - List available voices
- `GET /api/voice/:id` - Get specific voice
- `POST /api/voice/generate` - Generate voice preview
- `POST /api/voice/clone` - Clone voice from audio
- `POST /api/voice/test` - Test agent voice
- `POST /api/voice/preview` - Preview voice with settings

#### Agent Sync
- `GET /api/agent-sync/sync-from-backend` - Sync from Agent Backend
- `POST /api/agent-sync/deploy-to-pedro/:agentId` - Deploy to Pedro
- `POST /api/agent-sync/deploy-to-repconnect1/:agentId` - Deploy to RepConnect1
- `GET /api/agent-sync/pedro-agents` - List Pedro's agents
- `POST /api/agent-sync/import-pedro` - Import agents from Pedro

#### WebSocket Events
- `connection` - WebSocket connection status
- `agent-update` - Real-time agent updates
- `deployment-status` - Deployment progress updates
- `voice-generation-progress` - Voice generation progress
- `interaction-response` - Real-time chat responses
- `analytics-update` - Live analytics updates

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

**WebSocket connection failing**
- Check if WebSocket port is open
- Verify REACT_APP_WS_URL is correct
- System will automatically fallback to REST

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Central command view with agent statistics and deployment status*

### Agent Management
![Agent Management](docs/screenshots/agent-management.png)
*Import, configure, and deploy agents across platforms*

### Voice Studio
![Voice Studio](docs/screenshots/voice-studio.png)
*Design and test custom voice profiles*

### Interactive Testing
![Interactive Testing](docs/screenshots/interactive-testing.png)
*Real-time chat interface for agent testing*

### Analytics Dashboard
![Analytics](docs/screenshots/analytics.png)
*Monitor performance metrics and user sentiment*

## 🔮 Roadmap

### Version 1.1
- [ ] Advanced voice cloning with ElevenLabs integration
- [ ] Multi-language support (10+ languages)
- [ ] A/B testing framework for agent responses
- [ ] Custom webhook integrations

### Version 1.2
- [ ] AI-powered agent optimization
- [ ] Automated performance tuning
- [ ] Advanced sentiment analysis
- [ ] Team collaboration features

### Version 2.0
- [ ] Visual agent builder (drag-and-drop)
- [ ] Marketplace for agent templates
- [ ] Enterprise SSO integration
- [ ] Advanced compliance tools

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