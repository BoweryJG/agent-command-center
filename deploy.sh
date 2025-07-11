#!/bin/bash

# Deploy Agent Command Center to Netlify

echo "🚀 Deploying Agent Command Center to Netlify..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=build --site=agent-command-center

echo "✅ Deployment complete!"
echo "🔗 Your site will be available at: https://agent-command-center.netlify.app"