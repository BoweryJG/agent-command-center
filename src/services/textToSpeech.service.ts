// Browser-based Text-to-Speech Service
// Uses the Web Speech API for voice synthesis

interface VoiceConfig {
  voiceId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceMap: Map<string, SpeechSynthesisVoice> = new Map();

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Reload voices when they change
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    this.voiceMap.clear();
    
    // Map common voice IDs to actual voices
    const voiceMappings: Record<string, string[]> = {
      'EXAVITQu4vr4xnSDxMaL': ['Samantha', 'Victoria', 'Karen', 'female'],
      'nPczCjzI2devNBz1zQrb': ['Daniel', 'Alex', 'male'],
      'nicole': ['Nicole', 'Nicky', 'female'],
      'brian': ['Brian', 'male'],
      'harvey': ['Harvey', 'male'],
      'samantha': ['Samantha', 'female'],
      'marcus': ['Marcus', 'male']
    };

    // Try to find best matching voice for each ID
    Object.entries(voiceMappings).forEach(([id, searches]) => {
      const voice = this.findBestVoice(searches);
      if (voice) {
        this.voiceMap.set(id, voice);
      }
    });
  }

  private findBestVoice(searches: string[]): SpeechSynthesisVoice | null {
    for (const search of searches) {
      const voice = this.voices.find(v => 
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (search === 'male' && v.name.includes('Male')) ||
        (search === 'female' && v.name.includes('Female'))
      );
      if (voice) return voice;
    }
    
    // Default to first English voice
    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  async speak(text: string, config: VoiceConfig = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      if (config.voiceId && this.voiceMap.has(config.voiceId)) {
        utterance.voice = this.voiceMap.get(config.voiceId)!;
      } else {
        // Use default voice
        utterance.voice = this.findBestVoice(['female']) || this.voices[0];
      }

      // Set speech parameters
      utterance.rate = config.rate || 1.0;
      utterance.pitch = config.pitch || 1.0;
      utterance.volume = config.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  async generateAudioBlob(text: string, config: VoiceConfig = {}): Promise<Blob> {
    // For now, we'll create a placeholder blob since Web Speech API doesn't provide audio data
    // In a real implementation, you'd use a TTS API that returns audio data
    
    // Create a silent audio blob as placeholder
    const duration = text.length * 0.05; // Rough estimate
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate silent audio
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }
    
    // Speak the text using Web Speech API
    this.speak(text, config).catch(console.error);
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  getAvailableVoices(): Array<{ id: string; name: string; lang: string }> {
    return this.voices.map(voice => ({
      id: voice.voiceURI,
      name: voice.name,
      lang: voice.lang
    }));
  }

  stop() {
    this.synth.cancel();
  }
}

export const ttsService = new TextToSpeechService();