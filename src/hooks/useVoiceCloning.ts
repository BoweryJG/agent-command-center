import { useState, useCallback } from 'react';
import { voiceApi, VoiceCloneRequest, VoiceResponse } from '../utils/voiceApi';

export const useVoiceCloning = () => {
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const cloneVoice = useCallback(async (params: VoiceCloneRequest): Promise<VoiceResponse | null> => {
    setIsCloning(true);
    setError(null);
    setProgress(0);

    try {
      if (!params.url && !params.file) {
        throw new Error('Either URL or file must be provided');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await voiceApi.cloneVoice(params);

      clearInterval(progressInterval);
      setProgress(100);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsCloning(false);
    }
  }, []);

  const generateVoice = useCallback(async (voiceId: string, text: string): Promise<string | null> => {
    try {
      const result = await voiceApi.generateSpeech({ voiceId, text });
      return result.audioUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    }
  }, []);

  return {
    cloneVoice,
    generateVoice,
    isCloning,
    error,
    progress,
  };
};