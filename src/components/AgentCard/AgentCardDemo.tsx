import React from 'react';
import { AgentCardCarousel, GhibliAgent, GhibliAgentCard } from './index';

// Sample agents data showcasing different nature elements and rarities
const sampleAgents: GhibliAgent[] = [
  {
    id: 'agent-1',
    name: 'Sylphina',
    title: 'Wind Whisperer',
    nature_element: 'wind',
    description: 'A gentle spirit who dances with the breeze and carries messages across the sky.',
    stats: {
      power: 65,
      wisdom: 85,
      speed: 95,
      harmony: 90,
      spirit: 80,
    },
    abilities: ['Wind Walk', 'Message Carrier', 'Storm Calm'],
    rarity: 'rare',
  },
  {
    id: 'agent-2',
    name: 'Ember',
    title: 'Flame Guardian',
    nature_element: 'fire',
    description: 'A passionate protector who tends the sacred flames and brings warmth to cold hearts.',
    stats: {
      power: 90,
      wisdom: 70,
      speed: 75,
      harmony: 60,
      spirit: 85,
    },
    abilities: ['Fire Dance', 'Warmth Aura', 'Phoenix Rise'],
    rarity: 'legendary',
  },
  {
    id: 'agent-3',
    name: 'Mossheart',
    title: 'Forest Sage',
    nature_element: 'forest',
    description: 'An ancient guardian of the deep woods, wise in the ways of nature and growth.',
    stats: {
      power: 70,
      wisdom: 95,
      speed: 50,
      harmony: 100,
      spirit: 75,
    },
    abilities: ['Root Network', 'Healing Touch', 'Forest Voice'],
    rarity: 'mythical',
  },
  {
    id: 'agent-4',
    name: 'Tidecaller',
    title: 'Ocean\'s Voice',
    nature_element: 'water',
    description: 'A mystical being who speaks with the waves and knows the secrets of the deep.',
    stats: {
      power: 75,
      wisdom: 80,
      speed: 85,
      harmony: 85,
      spirit: 90,
    },
    abilities: ['Tidal Flow', 'Deep Sight', 'Wave Song'],
    rarity: 'rare',
  },
  {
    id: 'agent-5',
    name: 'Stoneheart',
    title: 'Mountain Keeper',
    nature_element: 'earth',
    description: 'A steadfast guardian of ancient mountains, strong and unmovable as the earth itself.',
    stats: {
      power: 95,
      wisdom: 75,
      speed: 40,
      harmony: 80,
      spirit: 70,
    },
    abilities: ['Stone Shield', 'Earth Tremor', 'Crystal Growth'],
    rarity: 'common',
  },
  {
    id: 'agent-6',
    name: 'Lumina',
    title: 'Spirit Walker',
    nature_element: 'spirit',
    description: 'A ethereal being who walks between worlds and guides lost souls to peace.',
    stats: {
      power: 80,
      wisdom: 90,
      speed: 80,
      harmony: 95,
      spirit: 100,
    },
    abilities: ['Spirit Bond', 'Astral Walk', 'Soul Heal'],
    rarity: 'mythical',
  },
];

export const AgentCardDemo: React.FC = () => {
  const handleSelectAgent = (agent: GhibliAgent) => {
    console.log('Selected agent:', agent);
    // Handle agent selection - could open a detailed view, etc.
  };

  return (
    <div className="min-h-screen bg-neural-darker">
      <div className="py-16">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Ghibli Agent Collection
        </h1>
        
        <AgentCardCarousel
          agents={sampleAgents}
          onSelectAgent={handleSelectAgent}
          className="h-[600px]"
        />
        
        {/* Individual card showcase */}
        <div className="mt-16 px-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            Individual Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {sampleAgents.slice(0, 4).map((agent) => (
              <div key={agent.id} className="transform hover:scale-105 transition-transform">
                <GhibliAgentCard
                  agent={agent}
                  onClick={() => handleSelectAgent(agent)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};