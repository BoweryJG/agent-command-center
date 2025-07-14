-- Migration: 005_simplified_deployment_tracking.sql
-- Purpose: Create simplified deployment tracking for agents

-- Drop existing tables if they exist (cleanup from previous migrations)
DROP TABLE IF EXISTS agent_deployment_status CASCADE;
DROP VIEW IF EXISTS v_agent_deployment_overview CASCADE;

-- Create the simplified deployment status table
CREATE TABLE agent_deployment_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_agent_id TEXT UNIQUE NOT NULL,
    deployment_status TEXT NOT NULL DEFAULT 'draft' CHECK (deployment_status IN ('draft', 'ready', 'live')),
    platforms JSONB DEFAULT '[]'::jsonb,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_agent_deployment_external_id ON agent_deployment_status(external_agent_id);
CREATE INDEX idx_agent_deployment_status ON agent_deployment_status(deployment_status);
CREATE INDEX idx_agent_deployment_platforms ON agent_deployment_status USING GIN (platforms);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_deployment_status_updated_at 
    BEFORE UPDATE ON agent_deployment_status
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE agent_deployment_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all authenticated users to read deployment status
CREATE POLICY "Allow authenticated users to read deployment status" 
    ON agent_deployment_status
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert new deployment status
CREATE POLICY "Allow authenticated users to insert deployment status" 
    ON agent_deployment_status
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update deployment status
CREATE POLICY "Allow authenticated users to update deployment status" 
    ON agent_deployment_status
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete deployment status
CREATE POLICY "Allow authenticated users to delete deployment status" 
    ON agent_deployment_status
    FOR DELETE
    TO authenticated
    USING (true);

-- Create a view for easy querying of deployment status
CREATE VIEW v_agent_deployment_overview AS
SELECT 
    ads.id,
    ads.external_agent_id,
    ads.deployment_status,
    ads.platforms,
    CASE 
        WHEN jsonb_array_length(ads.platforms) = 0 THEN 'Not deployed'
        WHEN jsonb_array_length(ads.platforms) = 1 THEN ads.platforms->0->>'name'
        ELSE jsonb_array_length(ads.platforms)::text || ' platforms'
    END as platform_summary,
    ads.configuration,
    ads.created_at,
    ads.updated_at,
    -- Calculate time since last update
    EXTRACT(EPOCH FROM (NOW() - ads.updated_at)) / 3600 as hours_since_update
FROM agent_deployment_status ads;

-- Grant permissions on the view
GRANT SELECT ON v_agent_deployment_overview TO authenticated;

-- Add helpful comments
COMMENT ON TABLE agent_deployment_status IS 'Tracks deployment status and platform information for agents';
COMMENT ON COLUMN agent_deployment_status.external_agent_id IS 'Unique identifier from the agentbackend system';
COMMENT ON COLUMN agent_deployment_status.deployment_status IS 'Current deployment state: draft (in development), ready (tested), live (deployed)';
COMMENT ON COLUMN agent_deployment_status.platforms IS 'Array of platform objects with deployment details (e.g., [{name: "vercel", url: "...", deployed_at: "..."}])';
COMMENT ON COLUMN agent_deployment_status.configuration IS 'Custom configuration data for the agent deployment';
COMMENT ON VIEW v_agent_deployment_overview IS 'Simplified view of agent deployment status with calculated fields';