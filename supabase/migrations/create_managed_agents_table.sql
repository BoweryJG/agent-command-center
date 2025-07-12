-- Create managed_agents table for agent command center
CREATE TABLE IF NOT EXISTS managed_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  type VARCHAR(50) NOT NULL CHECK (type IN ('customer-service', 'sales', 'support', 'specialist')),
  
  -- Client information
  client JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Voice configuration
  voice JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Personality configuration
  personality JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Deployment information
  deployment JSONB NOT NULL DEFAULT '{"status": "draft"}'::jsonb,
  
  -- Configuration
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Stats
  stats JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_managed_agents_type ON managed_agents(type);
CREATE INDEX idx_managed_agents_deployment_status ON managed_agents((deployment->>'status'));
CREATE INDEX idx_managed_agents_client_id ON managed_agents((client->>'id'));

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_managed_agents_updated_at 
  BEFORE UPDATE ON managed_agents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE managed_agents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all agents
CREATE POLICY "Allow authenticated users to read agents" ON managed_agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create agents
CREATE POLICY "Allow authenticated users to create agents" ON managed_agents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own agents
CREATE POLICY "Allow authenticated users to update agents" ON managed_agents
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete their own agents
CREATE POLICY "Allow authenticated users to delete agents" ON managed_agents
  FOR DELETE
  TO authenticated
  USING (true);