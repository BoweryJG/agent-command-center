import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoiceAnalyzerProps {
  audioUrl?: string;
  isAnalyzing?: boolean;
}

interface VoiceCharacteristics {
  pitch: {
    average: number;
    min: number;
    max: number;
    variance: number;
  };
  tone: {
    warmth: number;
    brightness: number;
    richness: number;
    clarity: number;
  };
  speed: {
    wordsPerMinute: number;
    pauseFrequency: number;
    consistency: number;
  };
  emotion: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    excited: number;
  };
}

const VoiceAnalyzer: React.FC<VoiceAnalyzerProps> = ({ audioUrl, isAnalyzing = false }) => {
  const [characteristics, setCharacteristics] = useState<VoiceCharacteristics | null>(null);
  const [activeTab, setActiveTab] = useState<'pitch' | 'tone' | 'speed' | 'emotion'>('pitch');

  useEffect(() => {
    if (audioUrl && !isAnalyzing) {
      // Simulate analysis
      setTimeout(() => {
        setCharacteristics({
          pitch: {
            average: 165,
            min: 120,
            max: 220,
            variance: 15,
          },
          tone: {
            warmth: 75,
            brightness: 60,
            richness: 80,
            clarity: 90,
          },
          speed: {
            wordsPerMinute: 145,
            pauseFrequency: 25,
            consistency: 85,
          },
          emotion: {
            neutral: 40,
            happy: 25,
            sad: 5,
            angry: 10,
            excited: 20,
          },
        });
      }, 1500);
    }
  }, [audioUrl, isAnalyzing]);

  const renderPitchAnalysis = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-neural-light rounded-lg">
          <p className="text-sm text-text-muted">Average Pitch</p>
          <p className="text-2xl font-semibold mt-1">{characteristics?.pitch.average} Hz</p>
        </div>
        <div className="p-4 bg-neural-light rounded-lg">
          <p className="text-sm text-text-muted">Pitch Range</p>
          <p className="text-2xl font-semibold mt-1">
            {characteristics?.pitch.min}-{characteristics?.pitch.max} Hz
          </p>
        </div>
      </div>

      {/* Pitch Visualization */}
      <div className="p-4 bg-neural-darker rounded-lg">
        <p className="text-sm font-medium mb-3">Pitch Contour</p>
        <div className="h-32 flex items-end justify-between gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            const height = Math.sin(i * 0.3) * 30 + 50 + Math.random() * 20;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.02 }}
                className="flex-1 bg-gradient-to-t from-electric-purple to-electric-pink rounded-t"
              />
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-neural-light rounded-lg">
        <p className="text-sm text-text-muted mb-1">Pitch Variance</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-neural-darker rounded-full overflow-hidden">
            <div
              className="h-full bg-electric-purple"
              style={{ width: `${characteristics?.pitch.variance}%` }}
            />
          </div>
          <span className="text-sm font-medium">{characteristics?.pitch.variance}%</span>
        </div>
      </div>
    </div>
  );

  const renderToneAnalysis = () => (
    <div className="space-y-4">
      {Object.entries(characteristics?.tone || {}).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium capitalize">{key}</span>
            <span className="text-sm text-text-muted">{value}%</span>
          </div>
          <div className="relative h-3 bg-neural-darker rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute h-full bg-gradient-to-r from-electric-purple to-electric-pink"
            />
          </div>
        </div>
      ))}

      {/* Tone Radar Chart */}
      <div className="p-4 bg-neural-darker rounded-lg">
        <p className="text-sm font-medium mb-3">Tonal Balance</p>
        <div className="flex items-center justify-center h-32">
          <div className="relative w-32 h-32">
            {/* Placeholder for radar chart */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,40 90,70 50,90 10,70 10,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-neural-light"
              />
              <polygon
                points="50,25 75,42 75,58 50,75 25,58 25,42"
                fill="url(#gradient)"
                fillOpacity="0.3"
                stroke="url(#gradient)"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpeedAnalysis = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-neural-light rounded-lg text-center">
          <p className="text-3xl font-bold text-electric-purple">
            {characteristics?.speed.wordsPerMinute}
          </p>
          <p className="text-sm text-text-muted mt-1">Words/Min</p>
        </div>
        <div className="p-4 bg-neural-light rounded-lg text-center">
          <p className="text-3xl font-bold text-electric-pink">
            {characteristics?.speed.pauseFrequency}%
          </p>
          <p className="text-sm text-text-muted mt-1">Pause Rate</p>
        </div>
        <div className="p-4 bg-neural-light rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-400">
            {characteristics?.speed.consistency}%
          </p>
          <p className="text-sm text-text-muted mt-1">Consistency</p>
        </div>
      </div>

      {/* Speaking Speed Timeline */}
      <div className="p-4 bg-neural-darker rounded-lg">
        <p className="text-sm font-medium mb-3">Speaking Speed Timeline</p>
        <div className="space-y-2">
          {['Start', 'Middle', 'End'].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-12">{label}</span>
              <div className="flex-1 h-6 bg-neural-light rounded flex items-center px-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${70 + i * 10}%` }}
                  transition={{ delay: i * 0.1 }}
                  className="h-2 bg-gradient-to-r from-electric-purple to-electric-pink rounded"
                />
              </div>
              <span className="text-xs font-medium w-16 text-right">
                {145 + i * 5} WPM
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmotionAnalysis = () => (
    <div className="space-y-4">
      {/* Emotion Bars */}
      <div className="space-y-3">
        {Object.entries(characteristics?.emotion || {}).map(([emotion, value], i) => {
          const colors = {
            neutral: 'from-gray-400 to-gray-500',
            happy: 'from-yellow-400 to-orange-400',
            sad: 'from-blue-400 to-blue-600',
            angry: 'from-red-400 to-red-600',
            excited: 'from-purple-400 to-pink-400',
          };

          return (
            <motion.div
              key={emotion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="space-y-1"
            >
              <div className="flex justify-between">
                <span className="text-sm font-medium capitalize">{emotion}</span>
                <span className="text-sm text-text-muted">{value}%</span>
              </div>
              <div className="h-8 bg-neural-darker rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`h-full bg-gradient-to-r ${colors[emotion as keyof typeof colors]}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Emotion Summary */}
      <div className="p-4 bg-neural-light rounded-lg">
        <p className="text-sm font-medium mb-2">Emotional Profile</p>
        <p className="text-sm text-text-muted">
          This voice exhibits primarily neutral tones with hints of happiness and excitement,
          making it suitable for professional yet engaging content.
        </p>
      </div>
    </div>
  );

  if (isAnalyzing) {
    return (
      <div className="neural-card">
        <h3 className="text-xl font-semibold mb-6">Voice Analyzer</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-electric-purple border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text-muted">Analyzing voice characteristics...</p>
        </div>
      </div>
    );
  }

  if (!characteristics) {
    return (
      <div className="neural-card">
        <h3 className="text-xl font-semibold mb-6">Voice Analyzer</h3>
        <div className="text-center py-12 text-text-muted">
          <p>Upload or select a voice to analyze its characteristics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neural-card">
      <h3 className="text-xl font-semibold mb-6">Voice Analyzer</h3>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(['pitch', 'tone', 'speed', 'emotion'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-electric-purple to-electric-pink text-white'
                : 'bg-neural-light hover:bg-neural-accent/20'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'pitch' && renderPitchAnalysis()}
        {activeTab === 'tone' && renderToneAnalysis()}
        {activeTab === 'speed' && renderSpeedAnalysis()}
        {activeTab === 'emotion' && renderEmotionAnalysis()}
      </motion.div>

      {/* Export Button */}
      <div className="mt-6 pt-6 border-t border-neural-light">
        <button className="w-full neural-button">
          Export Analysis Report
        </button>
      </div>
    </div>
  );
};

export default VoiceAnalyzer;