import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PersonalityForge: React.FC = () => {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['professional', 'helpful']);

  const personalityTraits = [
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'friendly', label: 'Friendly', icon: '😊' },
    { id: 'humorous', label: 'Humorous', icon: '😄' },
    { id: 'empathetic', label: 'Empathetic', icon: '🤝' },
    { id: 'analytical', label: 'Analytical', icon: '🔍' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'patient', label: 'Patient', icon: '⏳' },
    { id: 'helpful', label: 'Helpful', icon: '🤲' },
  ];

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev =>
      prev.includes(traitId)
        ? prev.filter(id => id !== traitId)
        : [...prev, traitId]
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-cyan to-electric-blue bg-clip-text text-transparent">
          Personality Forge
        </h1>
        <p className="text-text-secondary mt-2">
          Craft unique AI personalities with precision
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trait Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="neural-card">
            <h3 className="text-xl font-semibold mb-4">Core Traits</h3>
            <div className="grid grid-cols-2 gap-3">
              {personalityTraits.map((trait) => (
                <button
                  key={trait.id}
                  onClick={() => toggleTrait(trait.id)}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    selectedTraits.includes(trait.id)
                      ? 'bg-gradient-to-r from-electric-cyan to-electric-blue text-white shadow-glow'
                      : 'bg-neural-light hover:bg-neural-accent/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{trait.icon}</div>
                  <p className="font-medium">{trait.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Personality Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neural-card mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Personality Matrix</h3>
            <div className="space-y-4">
              {[
                { axis: 'Formality', low: 'Casual', high: 'Formal' },
                { axis: 'Energy', low: 'Calm', high: 'Energetic' },
                { axis: 'Logic', low: 'Intuitive', high: 'Analytical' },
                { axis: 'Warmth', low: 'Reserved', high: 'Warm' },
              ].map((dimension) => (
                <div key={dimension.axis}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-text-muted">{dimension.low}</span>
                    <span className="text-sm font-medium">{dimension.axis}</span>
                    <span className="text-sm text-text-muted">{dimension.high}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full h-2 bg-neural-light rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06B6D4 0%, #06B6D4 50%, #374151 50%, #374151 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Preview & Templates */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Live Preview */}
          <div className="neural-card">
            <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
            <div className="bg-neural-darker rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-electric-cyan to-electric-blue flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-text-primary">
                    Hello! I'm your AI assistant with a {selectedTraits.join(', ')} personality. 
                    How can I help you today? I'm here to provide support with enthusiasm and precision!
                  </p>
                  <div className="flex gap-2 mt-3">
                    {selectedTraits.map(trait => (
                      <span
                        key={trait}
                        className="px-3 py-1 rounded-full bg-electric-cyan/20 text-electric-cyan text-xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personality Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="neural-card mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Quick Templates</h3>
            <div className="space-y-3">
              {[
                { name: 'Customer Support Pro', traits: ['helpful', 'patient', 'professional'] },
                { name: 'Creative Companion', traits: ['creative', 'friendly', 'humorous'] },
                { name: 'Data Analyst', traits: ['analytical', 'professional', 'helpful'] },
                { name: 'Life Coach', traits: ['empathetic', 'patient', 'friendly'] },
              ].map((template) => (
                <button
                  key={template.name}
                  className="w-full p-4 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {template.traits.join(' • ')}
                      </p>
                    </div>
                    <span className="text-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                      Apply →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button className="flex-1 neural-button">
              Deploy Personality
            </button>
            <button className="flex-1 py-3 px-6 rounded-lg font-medium border border-electric-cyan text-electric-cyan hover:bg-electric-cyan/10 transition-all duration-300">
              Save as Template
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalityForge;