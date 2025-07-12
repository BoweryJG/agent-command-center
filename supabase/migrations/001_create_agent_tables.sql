-- 001_create_agent_tables.sql
-- Create tables for Agent Command Center with Ghibli-style theming

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create platforms table
CREATE TABLE IF NOT EXISTS public.platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    api_endpoint TEXT,
    api_key TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table with Ghibli-style card fields
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'patient-care', 'sales', 'support', etc.
    platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
    
    -- Ghibli-style card theming
    ghibli_theme JSONB DEFAULT '{}' CHECK (
        ghibli_theme ?& ARRAY['card_color', 'nature_element', 'animation_type', 'special_particles']
    ),
    
    -- Agent configuration
    config JSONB DEFAULT '{}',
    capabilities JSONB DEFAULT '[]',
    personality_traits JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'maintenance', 'error')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE
);

-- Create agent_deployments table
CREATE TABLE IF NOT EXISTS public.agent_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES public.platforms(id) ON DELETE CASCADE,
    deployment_type TEXT NOT NULL CHECK (deployment_type IN ('production', 'staging', 'development')),
    version TEXT NOT NULL,
    
    -- Deployment details
    deployment_config JSONB DEFAULT '{}',
    deployment_url TEXT,
    deployment_status TEXT DEFAULT 'pending' CHECK (
        deployment_status IN ('pending', 'deploying', 'active', 'failed', 'inactive')
    ),
    
    -- Timestamps
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    deactivated_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(agent_id, deployment_type, version)
);

-- Create agent_metrics table
CREATE TABLE IF NOT EXISTS public.agent_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    deployment_id UUID REFERENCES public.agent_deployments(id) ON DELETE CASCADE,
    
    -- Metric details
    metric_type TEXT NOT NULL CHECK (
        metric_type IN ('interaction', 'performance', 'error', 'satisfaction', 'usage')
    ),
    metric_name TEXT NOT NULL,
    metric_value JSONB NOT NULL,
    
    -- Context
    session_id TEXT,
    user_id TEXT,
    context JSONB DEFAULT '{}',
    
    -- Timestamp
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT agent_metrics_recorded_at_check CHECK (recorded_at <= NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_agents_platform_id ON public.agents(platform_id);
CREATE INDEX idx_agents_type ON public.agents(type);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_is_active ON public.agents(is_active);

CREATE INDEX idx_deployments_agent_id ON public.agent_deployments(agent_id);
CREATE INDEX idx_deployments_platform_id ON public.agent_deployments(platform_id);
CREATE INDEX idx_deployments_status ON public.agent_deployments(deployment_status);
CREATE INDEX idx_deployments_type ON public.agent_deployments(deployment_type);

CREATE INDEX idx_metrics_agent_id ON public.agent_metrics(agent_id);
CREATE INDEX idx_metrics_deployment_id ON public.agent_metrics(deployment_id);
CREATE INDEX idx_metrics_type ON public.agent_metrics(metric_type);
CREATE INDEX idx_metrics_recorded_at ON public.agent_metrics(recorded_at DESC);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platforms table
CREATE POLICY "Enable read access for all users" ON public.platforms
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.platforms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.platforms
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.platforms
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for agents table
CREATE POLICY "Enable read access for all users" ON public.agents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.agents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.agents
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.agents
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for agent_deployments table
CREATE POLICY "Enable read access for all users" ON public.agent_deployments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.agent_deployments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.agent_deployments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.agent_deployments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for agent_metrics table
CREATE POLICY "Enable read access for all users" ON public.agent_metrics
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.agent_metrics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.agent_metrics
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.agent_metrics
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create view for agent analytics
CREATE VIEW public.agent_analytics AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    a.ghibli_theme,
    p.name as platform_name,
    COUNT(DISTINCT ad.id) as deployment_count,
    COUNT(DISTINCT am.id) as total_metrics,
    MAX(am.recorded_at) as last_metric_at,
    MAX(a.last_active_at) as last_active_at
FROM public.agents a
LEFT JOIN public.platforms p ON a.platform_id = p.id
LEFT JOIN public.agent_deployments ad ON a.id = ad.agent_id
LEFT JOIN public.agent_metrics am ON a.id = am.agent_id
GROUP BY a.id, a.name, a.type, a.status, a.ghibli_theme, p.name;

-- Grant access to the view
GRANT SELECT ON public.agent_analytics TO authenticated;
GRANT SELECT ON public.agent_analytics TO anon;