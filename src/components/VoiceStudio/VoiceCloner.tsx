import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceCloneProps {
  onCloneComplete?: (voiceId: string) => void;
}

const VoiceCloner: React.FC<VoiceCloneProps> = ({ onCloneComplete }) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      setIsValidUrl(true);
      return true;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl) {
      validateUrl(newUrl);
    } else {
      setIsValidUrl(true);
    }
  };

  const handleClone = async () => {
    if (!validateUrl(url)) return;

    setIsCloning(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Using the voice API service
      const formData = new FormData();
      formData.append('url', url);
      formData.append('name', `Cloned Voice ${new Date().toISOString()}`);
      
      const response = await fetch('/api/voice/clone', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(100);
        setClonedAudioUrl(data.audioUrl);
        if (onCloneComplete) {
          onCloneComplete(data.voiceId);
        }
      } else {
        throw new Error(`Failed to clone voice: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Clone error:', error);
      // You can add error handling UI here
    } finally {
      clearInterval(progressInterval);
      setIsCloning(false);
    }
  };

  return (
    <div className="neural-card">
      <h3 className="text-xl font-semibold mb-6">Voice Cloner</h3>
      
      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Audio URL</label>
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/voice-sample.mp3"
            className={`w-full px-4 py-2 rounded-lg bg-neural-light border transition-colors ${
              !isValidUrl ? 'border-red-500' : 'border-transparent focus:border-electric-purple'
            } focus:outline-none`}
          />
          {!isValidUrl && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid URL</p>
          )}
        </div>

        {/* Progress Bar */}
        {isCloning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span>Cloning voice...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-neural-light rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-electric-purple to-electric-pink"
              />
            </div>
          </motion.div>
        )}

        {/* Preview Player */}
        {clonedAudioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-neural-light rounded-lg"
          >
            <p className="text-sm font-medium mb-2">Preview Cloned Voice</p>
            <audio
              ref={audioRef}
              src={clonedAudioUrl}
              controls
              className="w-full"
            />
          </motion.div>
        )}

        {/* Clone Button */}
        <button
          onClick={handleClone}
          disabled={!url || !isValidUrl || isCloning}
          className="w-full neural-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCloning ? 'Cloning...' : 'Clone Voice'}
        </button>
      </div>
    </div>
  );
};

export default VoiceCloner;