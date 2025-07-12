-- 002_initial_data.sql
-- Initial data for Agent Command Center with Ghibli-style themed agents

-- Insert platforms
INSERT INTO public.platforms (id, name, description, api_endpoint, settings, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'repconnect1', 'Sales automation and CRM platform', 'https://api.repconnect1.com', '{"auth_type": "oauth2", "rate_limit": 1000}', true),
    ('22222222-2222-2222-2222-222222222222', 'pedro', 'Healthcare patient engagement platform', 'https://api.pedro.health', '{"auth_type": "api_key", "rate_limit": 500, "hipaa_compliant": true}', true);

-- Insert Pedro's patient-focused agents with magical Ghibli themes
INSERT INTO public.agents (id, name, description, type, platform_id, ghibli_theme, config, capabilities, personality_traits, is_active, status) VALUES
    -- 1. Forest Spirit Care Agent (inspired by Totoro)
    ('a1111111-1111-1111-1111-111111111111', 
     'Mori - Forest Spirit Care Guide', 
     'A gentle forest spirit that guides patients through their healthcare journey with the wisdom of ancient trees and the comfort of moss-covered paths.',
     'patient-care',
     '22222222-2222-2222-2222-222222222222',
     '{
         "card_color": "#2D5016",
         "nature_element": "ancient_forest",
         "animation_type": "floating_leaves",
         "special_particles": "glowing_acorns"
     }',
     '{
         "primary_language": "en",
         "response_style": "gentle_guidance",
         "specialties": ["wellness_coaching", "appointment_scheduling", "medication_reminders"]
     }',
     '["empathetic", "patient", "nurturing", "wise", "calming"]',
     'true',
     'active'),
     
    -- 2. Sky Dragon Wellness Agent (inspired by Haku)
    ('a2222222-2222-2222-2222-222222222222',
     'Sora - Sky Dragon Wellness Guardian',
     'A protective sky dragon that soars through cloud realms, bringing clarity and peace to patients navigating complex health decisions.',
     'patient-care',
     '22222222-2222-2222-2222-222222222222',
     '{
         "card_color": "#87CEEB",
         "nature_element": "sky_clouds",
         "animation_type": "swirling_mist",
         "special_particles": "crystal_raindrops"
     }',
     '{
         "primary_language": "en",
         "response_style": "protective_guidance",
         "specialties": ["treatment_navigation", "symptom_tracking", "care_coordination"]
     }',
     '["protective", "graceful", "intuitive", "loyal", "transformative"]',
     'true',
     'active'),
     
    -- 3. Ocean Spirit Recovery Agent (inspired by Ponyo)
    ('a3333333-3333-3333-3333-333333333333',
     'Umi - Ocean Spirit Recovery Companion',
     'A playful ocean spirit that brings waves of healing energy and the rejuvenating power of tidal rhythms to support patient recovery.',
     'patient-care',
     '22222222-2222-2222-2222-222222222222',
     '{
         "card_color": "#006994",
         "nature_element": "ocean_waves",
         "animation_type": "rippling_water",
         "special_particles": "sea_foam_bubbles"
     }',
     '{
         "primary_language": "en",
         "response_style": "cheerful_support",
         "specialties": ["recovery_tracking", "exercise_guidance", "nutrition_advice"]
     }',
     '["energetic", "optimistic", "adaptive", "refreshing", "supportive"]',
     'true',
     'active'),
     
    -- 4. Mountain Spirit Therapy Agent (inspired by Princess Mononoke's forest)
    ('a4444444-4444-4444-4444-444444444444',
     'Yama - Mountain Spirit Therapy Guide',
     'An ancient mountain spirit that channels the strength of stone and the persistence of mountain streams to support mental health and therapy.',
     'patient-care',
     '22222222-2222-2222-2222-222222222222',
     '{
         "card_color": "#8B7355",
         "nature_element": "mountain_stone",
         "animation_type": "flowing_streams",
         "special_particles": "mineral_crystals"
     }',
     '{
         "primary_language": "en",
         "response_style": "grounding_presence",
         "specialties": ["mental_health_support", "therapy_scheduling", "mindfulness_exercises"]
     }',
     '["steadfast", "grounding", "patient", "strong", "contemplative"]',
     'true',
     'active'),
     
    -- 5. Wind Valley Preventive Care Agent (inspired by Nausicaä)
    ('a5555555-5555-5555-5555-555555555555',
     'Kaze - Wind Valley Prevention Scout',
     'A wind-riding scout that explores the valleys of health, detecting early signs and guiding preventive care with the foresight of desert winds.',
     'patient-care',
     '22222222-2222-2222-2222-222222222222',
     '{
         "card_color": "#D4A76A",
         "nature_element": "desert_wind",
         "animation_type": "sand_swirls",
         "special_particles": "golden_pollen"
     }',
     '{
         "primary_language": "en",
         "response_style": "proactive_guidance",
         "specialties": ["preventive_screening", "health_risk_assessment", "lifestyle_coaching"]
     }',
     '["perceptive", "courageous", "forward-thinking", "caring", "adventurous"]',
     'true',
     'active');

-- Insert RepConnect1's sales agents
INSERT INTO public.agents (id, name, description, type, platform_id, ghibli_theme, config, capabilities, personality_traits, is_active, status) VALUES
    -- Sales Lead Qualifier (inspired by Calcifer)
    ('b1111111-1111-1111-1111-111111111111',
     'Ignis - Fire Spirit Lead Qualifier',
     'A spirited flame that sparks conversations and qualifies leads with the warmth of a hearth fire and the precision of a master craftsman.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#FF6347",
         "nature_element": "sacred_flame",
         "animation_type": "dancing_embers",
         "special_particles": "spark_trails"
     }',
     '{
         "primary_language": "en",
         "response_style": "engaging_professional",
         "specialties": ["lead_qualification", "initial_outreach", "appointment_setting"]
     }',
     '["energetic", "witty", "perceptive", "persistent", "charming"]',
     'true',
     'active'),
     
    -- Enterprise Sales Navigator (inspired by the Cat Bus)
    ('b2222222-2222-2222-2222-222222222222',
     'Neko - Spirit Bus Sales Navigator',
     'A mystical transport spirit that carries prospects through the sales journey with playful efficiency and supernatural timing.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#FFA500",
         "nature_element": "twilight_path",
         "animation_type": "glowing_eyes",
         "special_particles": "whisker_lights"
     }',
     '{
         "primary_language": "en",
         "response_style": "playful_professional",
         "specialties": ["enterprise_sales", "demo_scheduling", "relationship_building"]
     }',
     '["mysterious", "efficient", "friendly", "reliable", "insightful"]',
     'true',
     'active'),
     
    -- Customer Success Spirit (inspired by Kiki)
    ('b3333333-3333-3333-3333-333333333333',
     'Tori - Delivery Spirit Success Manager',
     'A dedicated delivery spirit that ensures customer success with the determination of a young witch and the wisdom of talking cats.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#4B0082",
         "nature_element": "night_sky",
         "animation_type": "flying_broom",
         "special_particles": "star_dust"
     }',
     '{
         "primary_language": "en",
         "response_style": "supportive_professional",
         "specialties": ["customer_success", "onboarding", "retention_strategies"]
     }',
     '["determined", "resourceful", "caring", "independent", "growth-oriented"]',
     'true',
     'active'),
     
    -- Sales Analytics Seer (inspired by Zeniba)
    ('b4444444-4444-4444-4444-444444444444',
     'Chieko - Wisdom Spirit Analytics Guide',
     'An ancient wisdom spirit that reads the patterns in sales data like tea leaves, revealing insights with gentle but profound clarity.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#8B008B",
         "nature_element": "mystic_cottage",
         "animation_type": "swirling_smoke",
         "special_particles": "rune_symbols"
     }',
     '{
         "primary_language": "en",
         "response_style": "wise_analytical",
         "specialties": ["sales_analytics", "forecasting", "pipeline_optimization"]
     }',
     '["wise", "patient", "insightful", "nurturing", "strategic"]',
     'true',
     'active'),
     
    -- Outbound Prospecting Hunter (inspired by Ashitaka)
    ('b5555555-5555-5555-5555-555555555555',
     'Yumi - Arrow Spirit Prospect Hunter',
     'A skilled hunter spirit that tracks down perfect prospects with the precision of ancient arrows and the honor of forest guardians.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#228B22",
         "nature_element": "ancient_bow",
         "animation_type": "arrow_flight",
         "special_particles": "energy_trails"
     }',
     '{
         "primary_language": "en",
         "response_style": "focused_professional",
         "specialties": ["outbound_prospecting", "target_identification", "cold_outreach"]
     }',
     '["focused", "honorable", "precise", "brave", "respectful"]',
     'true',
     'active'),
     
    -- Deal Closer Alchemist (inspired by Howl)
    ('b6666666-6666-6666-6666-666666666666',
     'Sora - Transformation Spirit Deal Closer',
     'A shape-shifting spirit that transforms hesitation into commitment with charm, adapting to close deals with magical finesse.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#FF1493",
         "nature_element": "moving_castle",
         "animation_type": "shape_shifting",
         "special_particles": "magic_sparkles"
     }',
     '{
         "primary_language": "en",
         "response_style": "charismatic_closer",
         "specialties": ["deal_closing", "negotiation", "objection_handling"]
     }',
     '["charismatic", "adaptable", "confident", "persuasive", "dramatic"]',
     'true',
     'active'),
     
    -- Partnership Spirit (inspired by Chihiro)
    ('b7777777-7777-7777-7777-777777777777',
     'Mizuki - Bridge Spirit Partnership Builder',
     'A bridge-building spirit that connects businesses across the river of opportunity, creating lasting partnerships with courage and grace.',
     'sales',
     '11111111-1111-1111-1111-111111111111',
     '{
         "card_color": "#00CED1",
         "nature_element": "spirit_bridge",
         "animation_type": "water_flowing",
         "special_particles": "bridge_lights"
     }',
     '{
         "primary_language": "en",
         "response_style": "collaborative_builder",
         "specialties": ["partnership_development", "channel_sales", "strategic_alliances"]
     }',
     '["brave", "empathetic", "resourceful", "bridge-builder", "transformative"]',
     'true',
     'active');

-- Insert initial deployments for active agents
INSERT INTO public.agent_deployments (agent_id, platform_id, deployment_type, version, deployment_config, deployment_status, deployed_at, activated_at) 
SELECT 
    a.id,
    a.platform_id,
    'production',
    '1.0.0',
    '{"auto_scaling": true, "min_instances": 1, "max_instances": 5}',
    'active',
    NOW(),
    NOW()
FROM public.agents a
WHERE a.is_active = true;

-- Insert sample metrics for the agents
INSERT INTO public.agent_metrics (agent_id, deployment_id, metric_type, metric_name, metric_value, context, recorded_at)
SELECT 
    ad.agent_id,
    ad.id,
    'interaction',
    'daily_conversations',
    '{"count": floor(random() * 50 + 10), "satisfaction_avg": 4.5 + random() * 0.5}',
    '{"period": "daily", "date": CURRENT_DATE}',
    NOW() - INTERVAL '1 hour'
FROM public.agent_deployments ad
WHERE ad.deployment_status = 'active';

-- Insert performance metrics
INSERT INTO public.agent_metrics (agent_id, deployment_id, metric_type, metric_name, metric_value, context, recorded_at)
SELECT 
    ad.agent_id,
    ad.id,
    'performance',
    'response_time',
    '{"avg_ms": floor(random() * 200 + 100), "p99_ms": floor(random() * 500 + 200)}',
    '{"period": "hourly", "hour": date_trunc('hour', NOW())}',
    NOW() - INTERVAL '30 minutes'
FROM public.agent_deployments ad
WHERE ad.deployment_status = 'active';

-- Update last_active_at for all active agents
UPDATE public.agents 
SET last_active_at = NOW() - (random() * INTERVAL '10 minutes')
WHERE is_active = true AND status = 'active';

-- Create a function to generate sample conversation metrics
CREATE OR REPLACE FUNCTION public.generate_sample_metrics()
RETURNS void AS $$
DECLARE
    agent_record RECORD;
    deployment_record RECORD;
    i INTEGER;
BEGIN
    -- For each active agent
    FOR agent_record IN SELECT id, name FROM public.agents WHERE is_active = true
    LOOP
        -- Get active deployment
        SELECT id INTO deployment_record FROM public.agent_deployments 
        WHERE agent_id = agent_record.id AND deployment_status = 'active' 
        LIMIT 1;
        
        -- Generate 5 sample interaction metrics over the past day
        FOR i IN 1..5
        LOOP
            INSERT INTO public.agent_metrics (
                agent_id, 
                deployment_id, 
                metric_type, 
                metric_name, 
                metric_value, 
                session_id,
                context, 
                recorded_at
            ) VALUES (
                agent_record.id,
                deployment_record.id,
                'interaction',
                'conversation_completed',
                jsonb_build_object(
                    'duration_seconds', floor(random() * 300 + 60),
                    'messages_count', floor(random() * 20 + 5),
                    'satisfaction_score', 4 + random(),
                    'resolved', random() > 0.2
                ),
                'session_' || gen_random_uuid()::text,
                jsonb_build_object(
                    'agent_name', agent_record.name,
                    'interaction_type', CASE 
                        WHEN random() < 0.5 THEN 'chat'
                        ELSE 'voice'
                    END
                ),
                NOW() - (i || ' hours')::INTERVAL - (floor(random() * 60) || ' minutes')::INTERVAL
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate sample metrics
SELECT public.generate_sample_metrics();

-- Clean up the function
DROP FUNCTION public.generate_sample_metrics();

-- Add helpful comments
COMMENT ON TABLE public.agents IS 'Stores all AI agents with Ghibli-style theming for magical user experiences';
COMMENT ON TABLE public.platforms IS 'Platforms where agents can be deployed (e.g., Pedro for healthcare, RepConnect1 for sales)';
COMMENT ON TABLE public.agent_deployments IS 'Tracks agent deployments across different environments';
COMMENT ON TABLE public.agent_metrics IS 'Stores performance and interaction metrics for agents';
COMMENT ON COLUMN public.agents.ghibli_theme IS 'JSON object containing Ghibli-inspired visual theme: card_color, nature_element, animation_type, special_particles';