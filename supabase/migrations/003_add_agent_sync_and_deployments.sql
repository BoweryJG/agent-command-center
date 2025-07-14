-- 003_add_agent_sync_and_deployments.sql
-- Adds agent sync status tracking, deployment status enum, external IDs, and platform deployments

-- Create deployment_status enum type
CREATE TYPE deployment_status AS ENUM ('draft', 'ready', 'live');

-- Add new columns to agents table
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS deployment_status deployment_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE;

-- Create agent_sync_status table to track syncs from agentbackend
CREATE TABLE IF NOT EXISTS public.agent_sync_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('create', 'update', 'delete')),
    sync_status TEXT NOT NULL CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    sync_direction TEXT NOT NULL CHECK (sync_direction IN ('from_backend', 'to_backend')),
    
    -- Sync details
    request_payload JSONB,
    response_payload JSONB,
    error_details JSONB,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    CONSTRAINT agent_sync_status_started_at_check CHECK (started_at <= NOW()),
    CONSTRAINT agent_sync_status_completed_at_check CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- Create platform_deployments table to track which platforms each agent is deployed to
CREATE TABLE IF NOT EXISTS public.platform_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
    
    -- Deployment details
    deployment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'undeploying', 'undeployed')
    ),
    deployment_version TEXT,
    deployment_url TEXT,
    deployment_config JSONB DEFAULT '{}',
    
    -- Platform-specific identifiers
    platform_agent_id TEXT, -- The ID of the agent on the target platform
    platform_deployment_id TEXT, -- Platform-specific deployment ID
    
    -- Sync tracking
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT CHECK (sync_status IN ('synced', 'out_of_sync', 'error')),
    sync_error JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_at TIMESTAMP WITH TIME ZONE,
    undeployed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(agent_id, platform_id),
    CONSTRAINT platform_deployments_deployed_at_check CHECK (deployed_at IS NULL OR deployed_at >= created_at),
    CONSTRAINT platform_deployments_undeployed_at_check CHECK (undeployed_at IS NULL OR undeployed_at >= deployed_at)
);

-- Create indexes for better performance
CREATE INDEX idx_agents_deployment_status ON public.agents(deployment_status);
CREATE INDEX idx_agents_external_id ON public.agents(external_id);

CREATE INDEX idx_agent_sync_status_agent_id ON public.agent_sync_status(agent_id);
CREATE INDEX idx_agent_sync_status_external_id ON public.agent_sync_status(external_id);
CREATE INDEX idx_agent_sync_status_sync_status ON public.agent_sync_status(sync_status);
CREATE INDEX idx_agent_sync_status_started_at ON public.agent_sync_status(started_at DESC);

CREATE INDEX idx_platform_deployments_agent_id ON public.platform_deployments(agent_id);
CREATE INDEX idx_platform_deployments_platform_id ON public.platform_deployments(platform_id);
CREATE INDEX idx_platform_deployments_deployment_status ON public.platform_deployments(deployment_status);
CREATE INDEX idx_platform_deployments_platform_agent_id ON public.platform_deployments(platform_agent_id);

-- Apply update timestamp triggers
CREATE TRIGGER update_platform_deployments_updated_at BEFORE UPDATE ON public.platform_deployments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.agent_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_sync_status table
CREATE POLICY "Enable read access for all users" ON public.agent_sync_status
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.agent_sync_status
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.agent_sync_status
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.agent_sync_status
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for platform_deployments table
CREATE POLICY "Enable read access for all users" ON public.platform_deployments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.platform_deployments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.platform_deployments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.platform_deployments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Update the agent_analytics view to include deployment status
DROP VIEW IF EXISTS public.agent_analytics;
CREATE VIEW public.agent_analytics AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    a.deployment_status,
    a.external_id,
    a.ghibli_theme,
    p.name as platform_name,
    COUNT(DISTINCT ad.id) as deployment_count,
    COUNT(DISTINCT pd.id) as platform_deployment_count,
    COUNT(DISTINCT am.id) as total_metrics,
    MAX(am.recorded_at) as last_metric_at,
    MAX(a.last_active_at) as last_active_at,
    MAX(ass.started_at) as last_sync_at,
    COUNT(DISTINCT CASE WHEN pd.deployment_status = 'deployed' THEN pd.platform_id END) as active_platform_count
FROM public.agents a
LEFT JOIN public.platforms p ON a.platform_id = p.id
LEFT JOIN public.agent_deployments ad ON a.id = ad.agent_id
LEFT JOIN public.platform_deployments pd ON a.id = pd.agent_id
LEFT JOIN public.agent_metrics am ON a.id = am.agent_id
LEFT JOIN public.agent_sync_status ass ON a.id = ass.agent_id
GROUP BY a.id, a.name, a.type, a.status, a.deployment_status, a.external_id, a.ghibli_theme, p.name;

-- Grant access to the view
GRANT SELECT ON public.agent_analytics TO authenticated;
GRANT SELECT ON public.agent_analytics TO anon;

-- Add helpful comments
COMMENT ON TABLE public.agent_sync_status IS 'Tracks synchronization status between the agent command center and external agent backends';
COMMENT ON TABLE public.platform_deployments IS 'Tracks which platforms each agent is deployed to and their deployment status';
COMMENT ON COLUMN public.agents.deployment_status IS 'Current deployment readiness status: draft (in development), ready (ready to deploy), live (deployed and active)';
COMMENT ON COLUMN public.agents.external_id IS 'ID of the agent in the external agent backend system';
COMMENT ON COLUMN public.platform_deployments.platform_agent_id IS 'The ID assigned to this agent by the target platform';
COMMENT ON COLUMN public.platform_deployments.sync_status IS 'Synchronization status between command center and the platform';