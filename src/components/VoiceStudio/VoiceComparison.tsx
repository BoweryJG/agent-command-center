import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import WaveformVisualizer from './WaveformVisualizer';

interface VoiceComparisonProps {
  originalAudioUrl?: string;
  clonedAudioUrl?: string;
}

const VoiceComparison: React.FC<VoiceComparisonProps> = ({ 
  originalAudioUrl, 
  clonedAudioUrl 
}) => {
  const [activePlayer, setActivePlayer] = useState<'original' | 'cloned' | null>(null);
  const [originalProgress, setOriginalProgress] = useState(0);
  const [clonedProgress, setClonedProgress] = useState(0);
  const originalAudioRef = useRef<HTMLAudioElement>(null);
  const clonedAudioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = (type: 'original' | 'cloned') => {
    const audioRef = type === 'original' ? originalAudioRef : clonedAudioRef;
    const otherAudioRef = type === 'original' ? clonedAudioRef : originalAudioRef;
    
    if (audioRef.current && otherAudioRef.current) {
      // Pause the other audio
      otherAudioRef.current.pause();
      
      if (activePlayer === type) {
        audioRef.current.pause();
        setActivePlayer(null);
      } else {
        audioRef.current.play();
        setActivePlayer(type);
      }
    }
  };

  const handleTimeUpdate = (type: 'original' | 'cloned') => {
    const audioRef = type === 'original' ? originalAudioRef : clonedAudioRef;
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      if (type === 'original') {
        setOriginalProgress(progress);
      } else {
        setClonedProgress(progress);
      }
    }
  };

  const handleSeek = (type: 'original' | 'cloned', value: number) => {
    const audioRef = type === 'original' ? originalAudioRef : clonedAudioRef;
    if (audioRef.current) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };

  const voiceData = [
    {
      type: 'original' as const,
      title: 'Original Voice',
      audioUrl: originalAudioUrl,
      audioRef: originalAudioRef,
      progress: originalProgress,
      color: '#8B5CF6',
    },
    {
      type: 'cloned' as const,
      title: 'Cloned Voice',
      audioUrl: clonedAudioUrl,
      audioRef: clonedAudioRef,
      progress: clonedProgress,
      color: '#EC4899',
    },
  ];

  return (
    <div className="neural-card">
      <h3 className="text-xl font-semibold mb-6">Voice Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {voiceData.map((voice) => (
          <motion.div
            key={voice.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: voice.type === 'original' ? 0 : 0.1 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{voice.title}</h4>
              <div className={`w-2 h-2 rounded-full ${
                activePlayer === voice.type ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
            </div>

            {/* Waveform */}
            <div className="h-24 bg-neural-darker rounded-lg p-2">
              <WaveformVisualizer
                isActive={activePlayer === voice.type}
                color={voice.color}
              />
            </div>

            {/* Audio Player */}
            {voice.audioUrl ? (
              <div className="space-y-2">
                <audio
                  ref={voice.audioRef}
                  src={voice.audioUrl}
                  onTimeUpdate={() => handleTimeUpdate(voice.type)}
                  onEnded={() => setActivePlayer(null)}
                  className="hidden"
                />
                
                {/* Progress Bar */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={voice.progress}
                    onChange={(e) => handleSeek(voice.type, Number(e.target.value))}
                    className="w-full h-2 bg-neural-light rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${voice.color} 0%, ${voice.color} ${voice.progress}%, #374151 ${voice.progress}%, #374151 100%)`,
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePlayPause(voice.type)}
                    className={`p-3 rounded-lg transition-all ${
                      activePlayer === voice.type
                        ? 'bg-gradient-to-r from-electric-purple to-electric-pink text-white'
                        : 'bg-neural-light hover:bg-neural-accent/20'
                    }`}
                  >
                    {activePlayer === voice.type ? (
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
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted">
                <p>No audio available</p>
              </div>
            )}

            {/* Voice Characteristics */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Quality</span>
                <span className="font-medium">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Duration</span>
                <span className="font-medium">0:45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sample Rate</span>
                <span className="font-medium">48kHz</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Controls */}
      <div className="mt-6 pt-6 border-t border-neural-light">
        <div className="flex gap-4 justify-center">
          <button className="px-4 py-2 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors text-sm">
            A/B Test
          </button>
          <button className="px-4 py-2 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors text-sm">
            Export Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceComparison;