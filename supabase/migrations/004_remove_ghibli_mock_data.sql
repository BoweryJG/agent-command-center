-- 004_remove_ghibli_mock_data.sql
-- Removes all mock Ghibli-themed data from the initial seed

-- Delete all agent metrics (they reference agents that will be deleted)
DELETE FROM public.agent_metrics;

-- Delete all agent deployments (they reference agents that will be deleted)
DELETE FROM public.agent_deployments;

-- Delete all agents with Ghibli themes
DELETE FROM public.agents 
WHERE id IN (
    -- Pedro's patient-care agents
    'a1111111-1111-1111-1111-111111111111', -- Mori - Forest Spirit Care Guide
    'a2222222-2222-2222-2222-222222222222', -- Sora - Sky Dragon Wellness Guardian
    'a3333333-3333-3333-3333-333333333333', -- Umi - Ocean Spirit Recovery Companion
    'a4444444-4444-4444-4444-444444444444', -- Yama - Mountain Spirit Therapy Guide
    'a5555555-5555-5555-5555-555555555555', -- Kaze - Wind Valley Prevention Scout
    -- RepConnect1's sales agents
    'b1111111-1111-1111-1111-111111111111', -- Ignis - Fire Spirit Lead Qualifier
    'b2222222-2222-2222-2222-222222222222', -- Neko - Spirit Bus Sales Navigator
    'b3333333-3333-3333-3333-333333333333', -- Tori - Delivery Spirit Success Manager
    'b4444444-4444-4444-4444-444444444444', -- Chieko - Wisdom Spirit Analytics Guide
    'b5555555-5555-5555-5555-555555555555', -- Yumi - Arrow Spirit Prospect Hunter
    'b6666666-6666-6666-6666-666666666666', -- Sora - Transformation Spirit Deal Closer
    'b7777777-7777-7777-7777-777777777777'  -- Mizuki - Bridge Spirit Partnership Builder
);

-- Delete the mock platforms
DELETE FROM public.platforms 
WHERE id IN (
    '11111111-1111-1111-1111-111111111111', -- repconnect1
    '22222222-2222-2222-2222-222222222222'  -- pedro
);

-- Remove the ghibli_theme column from agents table as it's no longer needed
ALTER TABLE public.agents DROP COLUMN IF EXISTS ghibli_theme;

-- Update the agent_analytics view to remove ghibli_theme reference
DROP VIEW IF EXISTS public.agent_analytics;
CREATE VIEW public.agent_analytics AS
SELECT 
    a.id,
    a.name,
    a.type,
    a.status,
    a.deployment_status,
    a.external_id,
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
GROUP BY a.id, a.name, a.type, a.status, a.deployment_status, a.external_id, p.name;

-- Grant access to the updated view
GRANT SELECT ON public.agent_analytics TO authenticated;
GRANT SELECT ON public.agent_analytics TO anon;

-- Update table comment to remove Ghibli reference
COMMENT ON TABLE public.agents IS 'Stores all AI agents managed by the command center';

-- Add comment about the removal
COMMENT ON SCHEMA public IS 'Agent Command Center schema - Ghibli-themed mock data removed in migration 004';