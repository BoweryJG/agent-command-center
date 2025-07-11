import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuickClips: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Clips', icon: '📁' },
    { id: 'greetings', label: 'Greetings', icon: '👋' },
    { id: 'support', label: 'Support', icon: '🛟' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'custom', label: 'Custom', icon: '✨' },
  ];

  const clips = [
    {
      id: 1,
      title: 'Welcome Message',
      category: 'greetings',
      duration: '0:15',
      uses: 1243,
      rating: 4.8,
      text: 'Hello! Welcome to our service. How can I assist you today?',
    },
    {
      id: 2,
      title: 'Technical Support Intro',
      category: 'support',
      duration: '0:20',
      uses: 856,
      rating: 4.6,
      text: "I'm here to help with any technical issues you're experiencing.",
    },
    {
      id: 3,
      title: 'Product Recommendation',
      category: 'sales',
      duration: '0:30',
      uses: 632,
      rating: 4.9,
      text: 'Based on your preferences, I have some great recommendations for you.',
    },
    {
      id: 4,
      title: 'Closing Statement',
      category: 'greetings',
      duration: '0:10',
      uses: 1105,
      rating: 4.7,
      text: 'Thank you for contacting us. Have a wonderful day!',
    },
    {
      id: 5,
      title: 'Troubleshooting Guide',
      category: 'support',
      duration: '0:45',
      uses: 421,
      rating: 4.5,
      text: "Let's walk through some troubleshooting steps together.",
    },
    {
      id: 6,
      title: 'Special Offer',
      category: 'sales',
      duration: '0:25',
      uses: 789,
      rating: 4.8,
      text: 'I have an exclusive offer that might interest you!',
    },
  ];

  const filteredClips = selectedCategory === 'all' 
    ? clips 
    : clips.filter(clip => clip.category === selectedCategory);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-blue to-electric-purple bg-clip-text text-transparent">
          Quick Clips
        </h1>
        <p className="text-text-secondary mt-2">
          Pre-built responses and conversation snippets
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 overflow-x-auto pb-2"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-electric-blue to-electric-purple text-white shadow-glow'
                : 'bg-neural-light hover:bg-neural-accent/20'
            }`}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clips Grid */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredClips.map((clip, index) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="neural-card hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-lg">{clip.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                    <span>{clip.duration}</span>
                    <span>•</span>
                    <span>{clip.uses} uses</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      ⭐ {clip.rating}
                    </span>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors">
                  ▶️
                </button>
              </div>
              <p className="text-text-secondary text-sm italic">"{clip.text}"</p>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 rounded-lg bg-electric-blue/20 text-electric-blue text-sm hover:bg-electric-blue/30 transition-colors">
                  Use Now
                </button>
                <button className="px-3 py-1 rounded-lg bg-neural-light text-text-secondary text-sm hover:bg-neural-accent/20 transition-colors">
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Create New Clip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="neural-card h-full">
            <h3 className="text-xl font-semibold mb-4">Create New Clip</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Clip Title</label>
                <input
                  type="text"
                  placeholder="Enter clip title..."
                  className="w-full px-4 py-2 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-blue/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-4 py-2 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-blue/50 focus:outline-none transition-colors">
                  <option value="">Select category...</option>
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Response Text</label>
                <textarea
                  placeholder="Enter the response text..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-blue/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Voice Settings</label>
                <div className="grid grid-cols-2 gap-3">
                  <select className="px-4 py-2 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-blue/50 focus:outline-none transition-colors">
                    <option>Harvey</option>
                    <option>Synthia</option>
                    <option>Echo</option>
                    <option>Nova</option>
                  </select>
                  <select className="px-4 py-2 rounded-lg bg-neural-light border border-neural-accent/20 focus:border-electric-blue/50 focus:outline-none transition-colors">
                    <option>Normal Speed</option>
                    <option>Slow</option>
                    <option>Fast</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 neural-button">
                  Generate Clip
                </button>
                <button className="flex-1 py-3 px-6 rounded-lg font-medium border border-electric-purple text-electric-purple hover:bg-electric-purple/10 transition-all duration-300">
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="neural-card mt-6"
          >
            <h3 className="text-xl font-semibold mb-4">Popular This Week</h3>
            <div className="space-y-3">
              {clips.slice(0, 3).map((clip, index) => (
                <div
                  key={clip.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neural-light/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-electric-blue">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{clip.title}</p>
                      <p className="text-xs text-text-muted">{clip.uses} uses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    ⭐ {clip.rating}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickClips;