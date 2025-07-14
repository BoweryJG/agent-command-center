// Voice API utilities for backend integration

const API_BASE_URL = process.env.REACT_APP_AGENT_BACKEND_URL || 'https://agentbackend-2932.onrender.com';

export interface VoiceCloneRequest {
  url?: string;
  file?: File;
  name: string;
  settings?: {
    stability: number;
    similarityBoost: number;
    style: number;
  };
}

export interface VoiceGenerateRequest {
  voiceId: string;
  text: string;
  settings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    pitch?: number;
    speed?: number;
  };
}

export interface VoiceResponse {
  voiceId: string;
  audioUrl: string;
  name: string;
  createdAt: string;
}

export const voiceApi = {
  // Clone a voice from URL or file
  async cloneVoice(request: VoiceCloneRequest): Promise<VoiceResponse> {
    const formData = new FormData();
    
    if (request.url) {
      formData.append('url', request.url);
    } else if (request.file) {
      formData.append('audio', request.file);
    }
    
    formData.append('name', request.name);
    if (request.settings) {
      formData.append('settings', JSON.stringify(request.settings));
    }

    const response = await fetch(`${API_BASE_URL}/api/voice/clone`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to clone voice: ${response.statusText}`);
    }

    return response.json();
  },

  // Generate speech with a cloned voice
  async generateSpeech(request: VoiceGenerateRequest): Promise<{ audioUrl: string }> {
    const response = await fetch(`${API_BASE_URL}/api/voice/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    return response.json();
  },

  // Get all available voices
  async getVoices(): Promise<VoiceResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/voices`);

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a voice
  async deleteVoice(voiceId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/voice/${voiceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete voice: ${response.statusText}`);
    }
  },

  // Analyze voice characteristics
  async analyzeVoice(audioUrl: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/voice/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze voice: ${response.statusText}`);
    }

    return response.json();
  },
};