import React from 'react';
import { motion } from 'framer-motion';

interface VoiceLoadingStateProps {
  message?: string;
  progress?: number;
}

const VoiceLoadingState: React.FC<VoiceLoadingStateProps> = ({ 
  message = 'Loading voice data...', 
  progress 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Animated Voice Waveform */}
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-electric-purple to-electric-pink rounded-full"
              animate={{
                height: ['20px', '60px', '20px'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        {/* Circular Progress */}
        {progress !== undefined && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-neural-light"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray={377}
              initial={{ strokeDashoffset: 377 }}
              animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
              transition={{ duration: 0.3 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      <p className="text-text-muted mb-2">{message}</p>
      
      {progress !== undefined && (
        <p className="text-sm font-medium">{progress}%</p>
      )}
    </motion.div>
  );
};

export default VoiceLoadingState;