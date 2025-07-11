import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  VoiceCloner,
  VoiceLibrary,
  WaveformVisualizer,
  VoiceSettings,
  VoiceComparison,
  VoiceUploader,
  VoiceAnalyzer,
  VoiceTagManager,
  VoiceLoadingState,
  VoiceErrorState,
  VoicePreview,
} from '../components/VoiceStudio';
import type { VoiceSettingsData } from '../components/VoiceStudio';
import { useVoiceCloning } from '../hooks/useVoiceCloning';

const VoiceStudio: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState('harvey');
  const [isRecording, setIsRecording] = useState(false);
  const [activeView, setActiveView] = useState<'studio' | 'clone' | 'analyze' | 'compare'>('studio');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsData | null>(null);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { cloneVoice, isCloning, error: cloneError } = useVoiceCloning();

  const handleVoiceClone = async (voiceId: string) => {
    // Handle voice clone completion
    console.log('Voice cloned:', voiceId);
  };

  const handleFileUpload = (file: File, audioUrl: string) => {
    setOriginalAudioUrl(audioUrl);
    setActiveView('analyze');
  };

  const handleSettingsChange = (settings: VoiceSettingsData) => {
    setVoiceSettings(settings);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent">
          Voice Studio
        </h1>
        <p className="text-text-secondary mt-2">
          Design and customize AI voice profiles
        </p>
      </motion.div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'studio', label: 'Voice Studio' },
          { id: 'clone', label: 'Clone Voice' },
          { id: 'analyze', label: 'Analyze' },
          { id: 'compare', label: 'Compare' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === tab.id
                ? 'bg-gradient-to-r from-electric-purple to-electric-pink text-white'
                : 'bg-neural-light hover:bg-neural-accent/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Studio View */}
      {activeView === 'studio' && (
        <div className="space-y-6">
          {/* Show error or loading states */}
          {error && (
            <VoiceErrorState
              error={error}
              onRetry={() => setError(null)}
              suggestions={[
                'Check your internet connection',
                'Ensure the audio file is in a supported format',
                'Try a smaller file size (under 10MB)',
              ]}
            />
          )}

          {isLoading ? (
            <VoiceLoadingState message="Loading voice data..." />
          ) : (
            <>
              {/* Voice Library */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <VoiceLibrary
                  selectedVoice={selectedVoice}
                  onVoiceSelect={setSelectedVoice}
                />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Voice Settings and Tags */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-1 space-y-6"
                >
                  <VoiceSettings onSettingsChange={handleSettingsChange} />
                  <div className="neural-card">
                    <VoiceTagManager
                      voiceId={selectedVoice}
                      initialTags={selectedTags}
                      onTagsChange={setSelectedTags}
                    />
                  </div>
                </motion.div>

                {/* Voice Editor and Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div className="neural-card">
                    <h3 className="text-xl font-semibold mb-6">Voice Configuration</h3>
                    
                    {/* Waveform Visualizer */}
                    <WaveformVisualizer isActive={isRecording} />

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'neural-button'
                        }`}
                      >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                      <button className="flex-1 py-3 px-6 rounded-lg font-medium border border-electric-purple text-electric-purple hover:bg-electric-purple/10 transition-all duration-300">
                        Preview Voice
                      </button>
                    </div>
                  </div>

                  {/* Voice Preview */}
                  <VoicePreview
                    voiceId={selectedVoice}
                    voiceName={selectedVoice.charAt(0).toUpperCase() + selectedVoice.slice(1)}
                  />

                  {/* Recent Recordings */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="neural-card"
                  >
                    <h3 className="text-xl font-semibold mb-4">Recent Recordings</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Welcome Message', duration: '0:45', date: '2 hours ago' },
                        { name: 'Product Demo', duration: '2:30', date: '1 day ago' },
                        { name: 'Support Response', duration: '1:15', date: '3 days ago' },
                      ].map((recording, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-neural-light/50 hover:bg-neural-light transition-colors"
                        >
                          <div>
                            <p className="font-medium">{recording.name}</p>
                            <p className="text-sm text-text-muted">
                              {recording.duration} • {recording.date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors">
                              ▶️
                            </button>
                            <button className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors">
                              ⬇️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Clone View */}
      {activeView === 'clone' && (
        <div className="space-y-6">
          {cloneError && (
            <VoiceErrorState
              error={cloneError}
              onRetry={() => window.location.reload()}
              suggestions={[
                'Check the audio URL is accessible',
                'Ensure the audio file is in MP3, WAV, or M4A format',
                'Try uploading a file instead of using a URL',
              ]}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <VoiceCloner onCloneComplete={handleVoiceClone} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <VoiceUploader onUploadComplete={handleFileUpload} />
            </motion.div>
          </div>
        </div>
      )}

      {/* Analyze View */}
      {activeView === 'analyze' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <VoiceAnalyzer audioUrl={originalAudioUrl || undefined} />
        </motion.div>
      )}

      {/* Compare View */}
      {activeView === 'compare' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <VoiceComparison
            originalAudioUrl={originalAudioUrl || undefined}
            clonedAudioUrl={clonedAudioUrl || undefined}
          />
        </motion.div>
      )}
    </div>
  );
};

export default VoiceStudio;