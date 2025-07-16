import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WaveformVisualizer from './WaveformVisualizer';

interface VoicePreviewProps {
  voiceId: string;
  voiceName: string;
  sampleTexts?: string[];
  onGenerateComplete?: (audioUrl: string) => void;
}

const VoicePreview: React.FC<VoicePreviewProps> = ({
  voiceId,
  voiceName,
  sampleTexts = [
    'Hello! This is a sample of my voice. I can help you with various tasks.',
    'The quick brown fox jumps over the lazy dog.',
    'Welcome to our service. How may I assist you today?',
    'I speak clearly and naturally, making communication easy and effective.',
  ],
  onGenerateComplete,
}) => {
  const [selectedText, setSelectedText] = useState(sampleTexts[0]);
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    const textToGenerate = customText || selectedText;
    if (!textToGenerate.trim()) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://agentbackend-2932.onrender.com/api/voices/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId,
          text: textToGenerate,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setGeneratedAudioUrl(audioUrl);
        if (onGenerateComplete) {
          onGenerateComplete(audioUrl);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="neural-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Voice Preview - {voiceName}</h3>
        {generatedAudioUrl && (
          <button
            onClick={togglePlayback}
            className={`p-2 rounded-lg transition-all ${
              isPlaying
                ? 'bg-red-500 text-white'
                : 'bg-electric-purple text-white'
            }`}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Sample Texts */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-text-muted">Sample Texts</h4>
        <div className="space-y-2">
          {sampleTexts.map((text, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedText(text);
                setCustomText('');
              }}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedText === text && !customText
                  ? 'bg-electric-purple/20 border border-electric-purple'
                  : 'bg-neural-light hover:bg-neural-accent/20'
              }`}
            >
              <p className="text-sm">{text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text Input */}
      <div className="space-y-2 mb-6">
        <h4 className="text-sm font-medium text-text-muted">Custom Text</h4>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Enter your own text to preview..."
          className="w-full px-4 py-3 rounded-lg bg-neural-light border border-transparent focus:border-electric-purple focus:outline-none resize-none"
          rows={3}
        />
        <p className="text-xs text-text-muted">
          {customText.length}/500 characters
        </p>
      </div>

      {/* Waveform Visualizer */}
      {(isGenerating || isPlaying) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <WaveformVisualizer isActive={isPlaying} />
        </motion.div>
      )}

      {/* Audio Player */}
      {generatedAudioUrl && (
        <audio
          ref={audioRef}
          src={generatedAudioUrl}
          className="hidden"
        />
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || (!selectedText && !customText.trim())}
        className="w-full neural-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating Preview...
          </span>
        ) : (
          'Generate Preview'
        )}
      </button>

      {/* Generated Audio Info */}
      <AnimatePresence>
        {generatedAudioUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-neural-light rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Preview Ready</p>
                <p className="text-xs text-text-muted">Click play to listen</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded hover:bg-neural-accent/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-2 rounded hover:bg-neural-accent/20 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoicePreview;