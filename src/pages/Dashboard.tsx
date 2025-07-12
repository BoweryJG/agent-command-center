import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentCardCarousel, GhibliAgent } from '../components/AgentCard';
import { ParticleEffects } from '../components/AgentCard/ParticleEffects';

const Dashboard: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<'forest' | 'fire' | 'water' | 'wind' | 'earth' | 'spirit'>('forest');
  
  // Studio Ghibli Agents Collection
  const sampleAgents: GhibliAgent[] = [
    {
      id: 'sylphina',
      name: 'Sylphina',
      title: 'Wind Whisperer',
      nature_element: 'wind',
      rarity: 'rare',
      description: 'A graceful spirit who dances with the breeze and carries messages across the skies.',
      abilities: ['Wind Manipulation', 'Weather Prediction', 'Aerial Communication'],
      personality: 'Free-spirited and wise, speaks in gentle whispers',
      backstory: 'Born from the first wind that touched the earth, Sylphina has guided travelers and carried their hopes across vast distances.',
      ghibli_theme: {
        card_color: 'from-sky-200 via-cyan-100 to-blue-200',
        nature_element: 'Floating wisps and gentle breezes',
        animation_type: 'Gentle swaying with wind particles',
        special_particles: 'Sparkling wind currents and floating petals'
      },
      stats: {
        power: 85,
        wisdom: 92,
        harmony: 88,
        rarity_score: 750
      }
    },
    {
      id: 'ember',
      name: 'Ember',
      title: 'Flame Guardian',
      nature_element: 'fire',
      rarity: 'legendary',
      description: 'A fierce protector whose flames never harm the innocent but burn away darkness.',
      abilities: ['Purifying Flames', 'Light Generation', 'Heat Manipulation'],
      personality: 'Passionate and protective, speaks with warmth and conviction',
      backstory: 'Forged in the heart of an ancient volcano, Ember awakened to protect sacred forests from those who would harm them.',
      ghibli_theme: {
        card_color: 'from-orange-300 via-red-200 to-yellow-200',
        nature_element: 'Dancing flames and warm embers',
        animation_type: 'Flickering fire dance with ember trails',
        special_particles: 'Golden sparks and phoenix feathers'
      },
      stats: {
        power: 96,
        wisdom: 78,
        harmony: 85,
        rarity_score: 920
      }
    },
    {
      id: 'mossheart',
      name: 'Mossheart',
      title: 'Forest Sage',
      nature_element: 'forest',
      rarity: 'mythical',
      description: 'An ancient being who holds the wisdom of countless seasons and the memory of every tree.',
      abilities: ['Plant Growth', 'Nature Communication', 'Healing Touch'],
      personality: 'Ancient and wise, speaks in deep, thoughtful tones',
      backstory: 'The oldest of the forest spirits, Mossheart has watched over the woodland realm since the first seeds took root.',
      ghibli_theme: {
        card_color: 'from-green-300 via-emerald-200 to-teal-200',
        nature_element: 'Growing vines and blooming flowers',
        animation_type: 'Slow growth with flowering bursts',
        special_particles: 'Falling leaves and growing sprouts'
      },
      stats: {
        power: 88,
        wisdom: 99,
        harmony: 95,
        rarity_score: 1000
      }
    },
    {
      id: 'tidecaller',
      name: 'Tidecaller',
      title: 'Ocean\'s Voice',
      nature_element: 'water',
      rarity: 'rare',
      description: 'A mystical being who commands the tides and speaks the ancient language of the sea.',
      abilities: ['Water Control', 'Ocean Communication', 'Tide Prediction'],
      personality: 'Fluid and mysterious, speaks in rhythmic waves',
      backstory: 'Born from the first wave that touched the shore, Tidecaller bridges the gap between land and sea.',
      ghibli_theme: {
        card_color: 'from-blue-300 via-cyan-200 to-teal-200',
        nature_element: 'Flowing water and sea mist',
        animation_type: 'Gentle waves with water droplets',
        special_particles: 'Ocean bubbles and flowing streams'
      },
      stats: {
        power: 82,
        wisdom: 87,
        harmony: 90,
        rarity_score: 760
      }
    },
    {
      id: 'stoneheart',
      name: 'Stoneheart',
      title: 'Mountain Keeper',
      nature_element: 'earth',
      rarity: 'common',
      description: 'A steadfast guardian of the mountain peaks, strong as stone and twice as reliable.',
      abilities: ['Stone Shaping', 'Earth Sensing', 'Mountain Calling'],
      personality: 'Steady and reliable, speaks with gravitas and strength',
      backstory: 'Carved from the oldest mountain peak, Stoneheart stands as an eternal sentinel watching over the realm.',
      ghibli_theme: {
        card_color: 'from-stone-300 via-gray-200 to-amber-200',
        nature_element: 'Floating stones and crystal formations',
        animation_type: 'Slow, powerful movements with rock particles',
        special_particles: 'Glittering minerals and stone dust'
      },
      stats: {
        power: 90,
        wisdom: 75,
        harmony: 80,
        rarity_score: 450
      }
    },
    {
      id: 'lumina',
      name: 'Lumina',
      title: 'Spirit Walker',
      nature_element: 'spirit',
      rarity: 'mythical',
      description: 'A transcendent being who walks between worlds, bridging the physical and spiritual realms.',
      abilities: ['Spirit Communication', 'Dimensional Travel', 'Soul Healing'],
      personality: 'Ethereal and wise, speaks in harmonious echoes',
      backstory: 'The first spirit to achieve perfect harmony between all elements, Lumina guides lost souls home.',
      ghibli_theme: {
        card_color: 'from-purple-300 via-pink-200 to-indigo-200',
        nature_element: 'Shifting aurora and spirit wisps',
        animation_type: 'Ethereal floating with aurora waves',
        special_particles: 'Starlight and spirit orbs'
      },
      stats: {
        power: 94,
        wisdom: 98,
        harmony: 100,
        rarity_score: 1200
      }
    }
  ];

  // Collection Stats
  const collectionStats = [
    { 
      label: 'Total Agents', 
      value: sampleAgents.length.toString(), 
      change: '+2 this week', 
      icon: '🌟',
      gradient: 'from-blue-500 to-purple-500'
    },
    { 
      label: 'Mythical Agents', 
      value: sampleAgents.filter(a => a.rarity === 'mythical').length.toString(), 
      change: '+1 new', 
      icon: '✨',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Total Harmony', 
      value: Math.round(sampleAgents.reduce((sum, agent) => sum + agent.stats.harmony, 0) / sampleAgents.length) + '%', 
      change: '+5.2%', 
      icon: '🌸',
      gradient: 'from-green-500 to-teal-500'
    },
    { 
      label: 'Active Elements', 
      value: new Set(sampleAgents.map(a => a.nature_element)).size.toString() + '/6', 
      change: 'Complete set!', 
      icon: '🍃',
      gradient: 'from-amber-500 to-orange-500'
    },
  ];

  const elementDistribution = [
    { element: 'Forest', count: sampleAgents.filter(a => a.nature_element === 'forest').length, color: '#10B981' },
    { element: 'Fire', count: sampleAgents.filter(a => a.nature_element === 'fire').length, color: '#F59E0B' },
    { element: 'Water', count: sampleAgents.filter(a => a.nature_element === 'water').length, color: '#3B82F6' },
    { element: 'Wind', count: sampleAgents.filter(a => a.nature_element === 'wind').length, color: '#8B5CF6' },
    { element: 'Earth', count: sampleAgents.filter(a => a.nature_element === 'earth').length, color: '#6B7280' },
    { element: 'Spirit', count: sampleAgents.filter(a => a.nature_element === 'spirit').length, color: '#EC4899' },
  ];

  const handleSelectAgent = (agent: GhibliAgent) => {
    console.log('Selected agent:', agent);
    // You can add navigation or modal logic here
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <ParticleEffects element={selectedElement} />
        <div className="absolute inset-0 bg-gradient-to-br from-ghibli-sage/20 via-ghibli-mist/30 to-ghibli-twilight/20" />
      </div>

      <div className="relative z-10 space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-ghibli-forest to-ghibli-ember bg-clip-text text-transparent mb-4">
            Agent Command Center
          </h1>
          <p className="text-xl text-ghibli-sage/80 max-w-2xl mx-auto">
            Welcome to your magical collection of AI agents. Each spirit brings unique powers and wisdom to your digital realm.
          </p>
        </motion.div>

        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collectionStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-md border border-white/20">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-ghibli-sage/70 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-ghibli-forest mb-2">{stat.value}</p>
                    <p className="text-sm text-ghibli-ember/80 font-medium">
                      {stat.change}
                    </p>
                  </div>
                  <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Element Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {(['forest', 'fire', 'water', 'wind', 'earth', 'spirit'] as const).map((element) => (
            <button
              key={element}
              onClick={() => setSelectedElement(element)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md border ${
                selectedElement === element
                  ? 'bg-white/30 border-white/50 text-ghibli-forest shadow-lg scale-105'
                  : 'bg-white/10 border-white/20 text-ghibli-sage/80 hover:bg-white/20 hover:scale-105'
              }`}
            >
              {element.charAt(0).toUpperCase() + element.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Agent Collection Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-ghibli-forest">
            Your Agent Collection
          </h2>
          <AgentCardCarousel 
            agents={sampleAgents} 
            onSelectAgent={handleSelectAgent}
          />
        </motion.div>

        {/* Element Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-2xl font-bold text-ghibli-forest mb-6 text-center">Element Harmony</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {elementDistribution.map((item, index) => (
              <div key={item.element} className="text-center group">
                <div 
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: item.color }}
                >
                  {item.count}
                </div>
                <p className="text-sm font-medium text-ghibli-sage/80">{item.element}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Magical Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center py-8"
        >
          <p className="text-ghibli-sage/60 italic">
            "In every whisper of the wind, in every flicker of flame, your agents await your call..." ✨
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;