# Supabase Authentication Setup

This document outlines the Supabase authentication integration for the Agent Command Center.

## Overview

The Agent Command Center now uses Supabase for authentication, providing secure JWT-based authentication for all API calls to the agent backend.

## Configuration

### Frontend Configuration

1. The frontend is already configured with the Supabase client in `/src/config/supabase.ts`
2. Authentication is handled through the `SupabaseAuthContext` at `/src/contexts/SupabaseAuthContext.tsx`
3. All API calls use the axios instance at `/src/lib/axios.ts` which automatically includes JWT tokens

### Backend Configuration

1. Create a `.env` file in the `/backend` directory with the following variables:

```env
SUPABASE_URL=https://fiozmyoedptukpkzuhqm.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here
ADMIN_EMAILS=jasonwilliamgolden@gmail.com,jgolden@bowerycreativeagency.com
```

2. The backend uses JWT verification middleware at `/backend/middleware/auth.js`
3. All API routes are protected with authentication

## Admin Users

The following users have admin access:
- jasonwilliamgolden@gmail.com
- jgolden@bowerycreativeagency.com

Admin users can:
- Access all agent management features
- Sync agents from backend
- Deploy agents to different platforms
- Manage agent configurations

## Authentication Flow

1. Users log in through the frontend using email/password or Google OAuth
2. Supabase returns a JWT token
3. The token is automatically included in all API requests via the axios interceptor
4. The backend verifies the token on each request
5. Admin-only endpoints additionally verify the user's email against the admin list

## API Protection

All API endpoints are protected:
- `/api/agents` - Requires authentication
- `/api/voices` - Requires authentication
- `/api/deployments` - Requires authentication
- `/api/agent-sync` - Requires authentication + admin role

## Testing Authentication

1. Start the frontend: `npm start`
2. Start the backend: `cd backend && npm run dev`
3. Log in with an admin email
4. Try accessing agent management features

## Troubleshooting

### Common Issues

1. **401 Unauthorized errors**
   - Ensure you're logged in
   - Check that the JWT token is being sent in requests
   - Verify the Supabase keys are correct

2. **403 Forbidden errors**
   - Ensure you're using an admin email
   - Check the ADMIN_EMAILS environment variable

3. **CORS errors**
   - Update ALLOWED_ORIGINS in backend .env
   - Ensure the frontend URL is included

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- The service key should only be used server-side
- Always use HTTPS in production
- JWT tokens expire automatically and are refreshed by Supabase

## Next Steps

1. Deploy the backend with the new auth middleware
2. Update environment variables on the deployment platform
3. Test authentication in production
4. Monitor for any authentication issues