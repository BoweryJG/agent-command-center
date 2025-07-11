import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Voice {
  id: string;
  name: string;
  type: string;
  accent: string;
  usageCount: number;
  lastUsed: string;
  audioUrl?: string;
}

interface VoiceLibraryProps {
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
}

const VoiceLibrary: React.FC<VoiceLibraryProps> = ({ selectedVoice, onVoiceSelect }) => {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const voices: Voice[] = [
    { id: 'harvey', name: 'Harvey', type: 'Professional', accent: 'American', usageCount: 1250, lastUsed: '2 hours ago' },
    { id: 'synthia', name: 'Synthia', type: 'Friendly', accent: 'British', usageCount: 890, lastUsed: '1 day ago' },
    { id: 'echo', name: 'Echo', type: 'Robotic', accent: 'Neutral', usageCount: 456, lastUsed: '3 days ago' },
    { id: 'nova', name: 'Nova', type: 'Energetic', accent: 'Australian', usageCount: 234, lastUsed: '1 week ago' },
    { id: 'atlas', name: 'Atlas', type: 'Authoritative', accent: 'American', usageCount: 567, lastUsed: '4 hours ago' },
    { id: 'luna', name: 'Luna', type: 'Soothing', accent: 'Canadian', usageCount: 789, lastUsed: '2 days ago' },
  ];

  const tags = ['Professional', 'Friendly', 'Robotic', 'Energetic', 'Authoritative', 'Soothing'];

  const filteredVoices = voices.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.accent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || voice.type === selectedTag;
    return matchesSearch && matchesTag;
  });

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
      // Stop audio playback
    } else {
      setPlayingVoiceId(voiceId);
      // Start audio playback
      setTimeout(() => setPlayingVoiceId(null), 3000); // Simulate playback
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search voices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-neural-light border border-transparent focus:border-electric-purple focus:outline-none"
        />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTag === tag
                  ? 'bg-electric-purple text-white'
                  : 'bg-neural-light hover:bg-neural-accent/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((voice, index) => (
          <motion.div
            key={voice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`neural-card p-4 cursor-pointer transition-all duration-300 ${
                selectedVoice === voice.id
                  ? 'ring-2 ring-electric-purple'
                  : 'hover:bg-neural-light/50'
              }`}
              onClick={() => onVoiceSelect(voice.id)}
            >
              {/* Voice Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{voice.name}</h4>
                  <p className="text-sm text-text-muted">
                    {voice.type} • {voice.accent}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVoice(voice.id);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    playingVoiceId === voice.id
                      ? 'bg-electric-purple text-white'
                      : 'bg-neural-light hover:bg-neural-accent/20'
                  }`}
                >
                  {playingVoiceId === voice.id ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Usage Stats */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Usage</span>
                  <span className="font-medium">{voice.usageCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Last used</span>
                  <span className="font-medium">{voice.lastUsed}</span>
                </div>
              </div>

              {/* Visual Indicator */}
              {selectedVoice === voice.id && (
                <div className="mt-3 w-full h-1 bg-gradient-to-r from-electric-purple to-electric-pink rounded-full" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VoiceLibrary;