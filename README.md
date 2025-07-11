# Agent Command Center

A modern React TypeScript application for managing AI agents with a Neural Elegance design system.

## Features

- **Dashboard**: Real-time monitoring and analytics for AI agents
- **Voice Studio**: Design and customize AI voice profiles
- **Personality Forge**: Craft unique AI personalities with precision
- **Agent Academy**: Train and enhance AI agents with specialized courses
- **Quick Clips**: Pre-built responses and conversation snippets

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS with custom Neural Elegance theme
- React Router for navigation
- Framer Motion for animations
- Recharts for data visualization
- React Query for server state management
- Socket.io Client for real-time updates

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Environment Variables

Create a `.env` file in the root directory with:

```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_ENVIRONMENT=development
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   ├── VoiceStudio/
│   ├── PersonalityForge/
│   ├── AgentAcademy/
│   ├── QuickClips/
│   └── Layout/
├── pages/
├── utils/
├── hooks/
├── types/
└── styles/
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Design System

The Neural Elegance design system features:
- Dark, sophisticated color palette
- Gradient accents with electric blue, purple, and pink
- Glass morphism effects
- Smooth animations and transitions
- Custom typography with Inter and JetBrains Mono fonts