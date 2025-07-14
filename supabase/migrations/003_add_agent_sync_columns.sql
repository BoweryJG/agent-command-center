-- 003_add_agent_sync_columns.sql
-- Add columns for external agent synchronization

-- Add columns to agents table for external synchronization
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS external_source TEXT,
ADD COLUMN IF NOT EXISTS voice_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS procedures_access JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS deployment_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS external_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS external_updated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for external sync
CREATE INDEX IF NOT EXISTS idx_agents_external_id ON public.agents(external_id);
CREATE INDEX IF NOT EXISTS idx_agents_external_source ON public.agents(external_source);
CREATE INDEX IF NOT EXISTS idx_agents_last_synced ON public.agents(last_synced_at);

-- Add unique constraint for external_id + external_source combination
ALTER TABLE public.agents 
ADD CONSTRAINT unique_external_agent UNIQUE (external_id, external_source);

-- Create sync_logs table for tracking synchronization operations
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    details JSONB DEFAULT '{}',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_operation ON public.sync_logs(operation);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_synced_at ON public.sync_logs(synced_at DESC);

-- Update deployment status enum if needed
ALTER TABLE public.agent_deployments 
DROP CONSTRAINT IF EXISTS agent_deployments_deployment_status_check;

ALTER TABLE public.agent_deployments 
ADD CONSTRAINT agent_deployments_deployment_status_check 
CHECK (deployment_status IN ('pending', 'deploying', 'active', 'failed', 'inactive', 'unknown'));

-- Add deployment tracking columns
ALTER TABLE public.agent_deployments 
ADD COLUMN IF NOT EXISTS undeployed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT;

-- Enable RLS for sync_logs table
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sync_logs table
CREATE POLICY "Enable read access for authenticated users" ON public.sync_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.sync_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.sync_logs TO authenticated;
GRANT SELECT ON public.sync_logs TO anon;

-- Add comment documentation
COMMENT ON COLUMN public.agents.external_id IS 'ID of the agent in the external system';
COMMENT ON COLUMN public.agents.external_source IS 'Source system where the agent originated (e.g., agentbackend-2932)';
COMMENT ON COLUMN public.agents.voice_config IS 'Voice configuration including provider, voice_id, and settings';
COMMENT ON COLUMN public.agents.knowledge_base IS 'Knowledge base configuration and content';
COMMENT ON COLUMN public.agents.procedures_access IS 'Array of procedures the agent has access to';
COMMENT ON COLUMN public.agents.deployment_info IS 'Deployment information including platforms and status';
COMMENT ON COLUMN public.agents.last_synced_at IS 'Timestamp of last synchronization with external system';
COMMENT ON TABLE public.sync_logs IS 'Log of synchronization operations between systems';