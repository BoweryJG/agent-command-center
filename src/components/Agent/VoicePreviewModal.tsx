import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, Sliders, RefreshCw, Download, Loader } from 'lucide-react';
import { ManagedAgent } from '../../types/agent.types';
import { agentManagementService } from '../../services/agentManagement.service';

interface VoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: ManagedAgent | null;
}

interface VoiceMetadata {
  name: string;
  language: string;
  accent: string;
  gender: string;
  age: string;
  style: string;
}

export const VoicePreviewModal: React.FC<VoicePreviewModalProps> = ({
  isOpen,
  onClose,
  agent
}) => {
  const [customText, setCustomText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceMetadata, setVoiceMetadata] = useState<VoiceMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Default preview texts
  const defaultTexts = [
    `Hello! I'm ${agent?.name || 'your AI assistant'}. I'm here to help you with any questions you might have.`,
    `Welcome! Let me introduce myself. ${agent?.description || 'I specialize in providing helpful and friendly assistance.'}`,
    `Thank you for choosing our service. How can I assist you today?`,
    `I understand you need help. Let me guide you through the process step by step.`
  ];

  const [selectedDefaultText, setSelectedDefaultText] = useState(0);

  useEffect(() => {
    if (isOpen && agent?.voiceConfig.voiceId) {
      fetchVoiceMetadata();
    }
  }, [isOpen, agent]);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const fetchVoiceMetadata = async () => {
    if (!agent?.voiceConfig.voiceId) return;

    try {
      const response = await agentManagementService.getVoiceMetadata(agent.voiceConfig.voiceId);
      setVoiceMetadata(response);
    } catch (error) {
      console.error('Failed to fetch voice metadata:', error);
      // Set some default metadata
      setVoiceMetadata({
        name: 'Custom Voice',
        language: 'English',
        accent: 'American',
        gender: 'Neutral',
        age: 'Adult',
        style: 'Professional'
      });
    }
  };

  const handleGeneratePreview = async () => {
    if (!agent?.voiceConfig.voiceId) {
      setError('No voice configured for this agent');
      return;
    }

    const textToSpeak = customText.trim() || defaultTexts[selectedDefaultText];
    
    setIsLoading(true);
    setError(null);

    try {
      const audioBlob = await agentManagementService.previewVoice({
        voiceId: agent.voiceConfig.voiceId,
        text: textToSpeak,
        settings: agent.voiceConfig.settings
      });

      // Create audio URL from blob
      const url = URL.createObjectURL(audioBlob);
      
      // Revoke previous URL if exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      
      // Auto-play the generated audio
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
    } catch (error: any) {
      console.error('Failed to generate voice preview:', error);
      setError(error.response?.data?.error || 'Failed to generate voice preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!audioUrl || !agent) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${agent.name}-voice-preview.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!agent) return null;

  const voiceSettings = agent.voiceConfig.settings;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-2xl bg-gradient-to-br from-surface-primary via-surface-secondary to-neural-light rounded-2xl shadow-2xl border border-neural-accent/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-neural-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-cyan to-electric-blue p-0.5">
                    <div className="w-full h-full rounded-xl bg-surface-primary flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-electric-cyan" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">Voice Preview</h2>
                    <p className="text-sm text-text-muted">{agent.name}'s Voice Configuration</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Voice Metadata */}
              {voiceMetadata && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="neural-card p-4">
                    <p className="text-sm text-text-muted mb-1">Voice Name</p>
                    <p className="font-medium text-text-primary">{voiceMetadata.name}</p>
                  </div>
                  <div className="neural-card p-4">
                    <p className="text-sm text-text-muted mb-1">Language</p>
                    <p className="font-medium text-text-primary">{voiceMetadata.language}</p>
                  </div>
                  <div className="neural-card p-4">
                    <p className="text-sm text-text-muted mb-1">Accent</p>
                    <p className="font-medium text-text-primary">{voiceMetadata.accent}</p>
                  </div>
                  <div className="neural-card p-4">
                    <p className="text-sm text-text-muted mb-1">Gender</p>
                    <p className="font-medium text-text-primary">{voiceMetadata.gender}</p>
                  </div>
                  <div className="neural-card p-4">
                    <p className="text-sm text-text-muted mb-1">Age</p>
                    <p className="font-medium text-text-primary">{voiceMetadata.age}</p>
                  </div>
                  <div className="neural-card p-4">
                    <p className="text-sm text-text-muted mb-1">Style</p>
                    <p className="font-medium text-text-primary">{voiceMetadata.style}</p>
                  </div>
                </div>
              )}

              {/* Voice Settings */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Voice Settings
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-1">Pitch</p>
                    <p className="text-lg font-medium text-electric-blue">{voiceSettings.pitch || 1.0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-1">Speed</p>
                    <p className="text-lg font-medium text-electric-purple">{voiceSettings.speed || 1.0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-1">Stability</p>
                    <p className="text-lg font-medium text-electric-cyan">{voiceSettings.stability || 0.5}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-muted mb-1">Similarity</p>
                    <p className="text-lg font-medium text-electric-pink">{voiceSettings.similarityBoost || 0.5}</p>
                  </div>
                </div>
              </div>

              {/* Preview Text */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Preview Text</h3>
                
                {/* Default Text Options */}
                <div className="mb-3">
                  <p className="text-sm text-text-muted mb-2">Select a default text:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {defaultTexts.map((text, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-neural-light/30 border border-neural-accent/20 hover:border-electric-blue/30 cursor-pointer transition-all"
                      >
                        <input
                          type="radio"
                          name="defaultText"
                          checked={selectedDefaultText === index && !customText}
                          onChange={() => {
                            setSelectedDefaultText(index);
                            setCustomText('');
                          }}
                          className="mt-1 text-electric-blue"
                        />
                        <span className="text-sm text-text-secondary">{text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Text */}
                <div>
                  <p className="text-sm text-text-muted mb-2">Or enter custom text:</p>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type your custom preview text here..."
                    className="w-full px-4 py-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <div className="p-4 bg-neural-light/30 border border-neural-accent/20 rounded-lg">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="p-3 rounded-full bg-electric-blue/20 hover:bg-electric-blue/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-electric-blue" />
                      ) : (
                        <Play className="w-5 h-5 text-electric-blue" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-1 bg-neural-accent/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-electric-blue to-electric-purple"
                          animate={{ width: isPlaying ? '100%' : '0%' }}
                          transition={{ duration: 3, ease: 'linear' }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
                      title="Download Audio"
                    >
                      <Download className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-neural-accent/20 hover:bg-neural-accent/30 text-text-secondary font-medium transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={handleGeneratePreview}
                  disabled={isLoading || !agent.voiceConfig.enabled}
                  className="px-6 py-2 bg-gradient-to-r from-electric-blue to-electric-purple hover:from-electric-purple hover:to-electric-pink text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Generate Preview
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoicePreviewModal;