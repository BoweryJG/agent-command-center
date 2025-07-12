import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getParticlesByElement, WindLines } from './ParticleEffects';

export interface AgentStats {
  power: number;
  wisdom: number;
  speed: number;
  harmony: number;
  spirit: number;
}

export interface GhibliAgent {
  id: string;
  name: string;
  title: string;
  nature_element: 'forest' | 'fire' | 'water' | 'wind' | 'earth' | 'spirit';
  description: string;
  stats: AgentStats;
  abilities: string[];
  avatar?: string;
  rarity: 'common' | 'rare' | 'legendary' | 'mythical';
  personality?: string;
  backstory?: string;
  ghibli_theme?: {
    card_color: string;
    nature_element: string;
    animation_type: string;
    special_particles: string;
  };
}

interface GhibliAgentCardProps {
  agent: GhibliAgent;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const rarityGradients = {
  common: 'from-ghibli-earth/20 to-ghibli-moss/20',
  rare: 'from-ghibli-sky/30 to-ghibli-water/30',
  legendary: 'from-ghibli-sunset/40 to-ghibli-fire/40',
  mythical: 'from-ghibli-spirit/50 to-ghibli-moonlight/50',
};

const elementColors = {
  forest: 'text-ghibli-forest border-ghibli-forest/50 bg-ghibli-forest/10',
  fire: 'text-ghibli-fire border-ghibli-fire/50 bg-ghibli-fire/10',
  water: 'text-ghibli-water border-ghibli-water/50 bg-ghibli-water/10',
  wind: 'text-ghibli-wind border-ghibli-wind/50 bg-ghibli-wind/10',
  earth: 'text-ghibli-earth border-ghibli-earth/50 bg-ghibli-earth/10',
  spirit: 'text-ghibli-spirit border-ghibli-spirit/50 bg-ghibli-spirit/10',
};

const StatGlyph: React.FC<{ stat: string; value: number; maxValue?: number }> = ({ 
  stat, 
  value, 
  maxValue = 100 
}) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="relative h-16 w-16">
      {/* Outer ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="opacity-20"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray={`${percentage * 1.76} 176`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Inner glyph */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs font-mono opacity-80">{value}</div>
      </div>
      
      {/* Stat label */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] uppercase tracking-wider opacity-60">
        {stat}
      </div>
    </div>
  );
};

export const GhibliAgentCard: React.FC<GhibliAgentCardProps> = ({
  agent,
  isSelected = false,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ParticleComponent = useMemo(() => getParticlesByElement(agent.nature_element), [agent.nature_element]);
  
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Card Container */}
      <div className={`
        relative w-72 h-96 rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-500 ease-out
        ${isSelected ? 'ring-4 ring-ghibli-spirit/50' : ''}
      `}>
        {/* Background with hand-drawn border effect */}
        <div className={`
          absolute inset-0 rounded-2xl
          bg-gradient-to-br ${rarityGradients[agent.rarity]}
          ${isHovered ? 'animate-nature-pulse' : ''}
        `}>
          {/* Hand-drawn border SVG */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ filter: 'url(#roughPaper)' }}
          >
            <defs>
              <filter id="roughPaper">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="1">
                  <feDistantLight azimuth="45" elevation="60" />
                </feDiffuseLighting>
              </filter>
            </defs>
            <rect 
              x="2" 
              y="2" 
              width="calc(100% - 4)" 
              height="calc(100% - 4)" 
              rx="16" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`${elementColors[agent.nature_element]} opacity-50`}
              strokeDasharray="4 2"
            />
          </svg>
        </div>
        
        {/* Particle Effects */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ParticleComponent count={8} />
              {agent.nature_element === 'wind' && <WindLines count={4} />}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Card Content */}
        <div className="relative z-10 h-full p-6 flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <motion.h3 
              className="text-2xl font-bold mb-1"
              animate={{ 
                textShadow: isHovered 
                  ? '0 0 20px rgba(255, 255, 255, 0.8)' 
                  : '0 0 0px rgba(255, 255, 255, 0)'
              }}
            >
              {agent.name}
            </motion.h3>
            <p className="text-sm opacity-80 italic">{agent.title}</p>
            
            {/* Element Badge */}
            <motion.div 
              className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs mt-2
                ${elementColors[agent.nature_element]}
              `}
              animate={isHovered ? { y: [-2, 2, -2] } : { y: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {agent.nature_element.toUpperCase()}
            </motion.div>
          </div>
          
          {/* Avatar Area */}
          {agent.avatar && (
            <div className="relative h-32 w-32 mx-auto mb-4">
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                animate={isHovered ? { 
                  rotateY: [0, 10, -10, 0],
                  transition: { duration: 2, repeat: Infinity }
                } : {}}
              >
                <img 
                  src={agent.avatar} 
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Aura effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, transparent 30%, ${
                    agent.nature_element === 'fire' ? 'rgba(255, 99, 71, 0.3)' :
                    agent.nature_element === 'water' ? 'rgba(70, 130, 180, 0.3)' :
                    agent.nature_element === 'forest' ? 'rgba(45, 80, 22, 0.3)' :
                    agent.nature_element === 'wind' ? 'rgba(224, 229, 229, 0.3)' :
                    agent.nature_element === 'earth' ? 'rgba(139, 115, 85, 0.3)' :
                    'rgba(221, 160, 221, 0.3)'
                  } 70%)`,
                }}
                animate={isHovered ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          )}
          
          {/* Stats as Magical Glyphs */}
          <div className="grid grid-cols-3 gap-2 mt-auto">
            {Object.entries(agent.stats).slice(0, 3).map(([stat, value]) => (
              <div key={stat} className="flex flex-col items-center">
                <StatGlyph stat={stat} value={value} />
              </div>
            ))}
          </div>
          
          {/* Abilities (shown on hover) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              >
                <p className="text-xs mb-2 opacity-80">{agent.description}</p>
                <div className="flex flex-wrap gap-1">
                  {agent.abilities.map((ability, index) => (
                    <span 
                      key={index}
                      className="text-[10px] px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                    >
                      {ability}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Rarity indicator */}
        <div className="absolute top-4 right-4">
          <motion.div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${agent.rarity === 'mythical' ? 'bg-gradient-to-br from-ghibli-spirit to-ghibli-moonlight' :
                agent.rarity === 'legendary' ? 'bg-gradient-to-br from-ghibli-sunset to-ghibli-fire' :
                agent.rarity === 'rare' ? 'bg-gradient-to-br from-ghibli-sky to-ghibli-water' :
                'bg-gradient-to-br from-ghibli-earth to-ghibli-moss'}
            `}
            animate={agent.rarity === 'mythical' || agent.rarity === 'legendary' ? {
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-xs font-bold">
              {agent.rarity === 'mythical' ? '★' :
               agent.rarity === 'legendary' ? '◆' :
               agent.rarity === 'rare' ? '●' : '○'}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};