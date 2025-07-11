import React from 'react';
import { motion } from 'framer-motion';

interface VoiceErrorStateProps {
  error: string;
  onRetry?: () => void;
  suggestions?: string[];
}

const VoiceErrorState: React.FC<VoiceErrorStateProps> = ({ error, onRetry, suggestions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="neural-card p-8 text-center"
    >
      {/* Error Icon */}
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Error Message */}
      <h3 className="text-xl font-semibold mb-2">Voice Processing Error</h3>
      <p className="text-text-muted mb-6">{error}</p>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mb-6 text-left max-w-md mx-auto">
          <p className="text-sm font-medium mb-2">Try the following:</p>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-text-muted flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-lg bg-electric-purple text-white hover:bg-electric-purple/80 transition-colors"
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-lg border border-electric-purple text-electric-purple hover:bg-electric-purple/10 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </motion.div>
  );
};

export default VoiceErrorState;