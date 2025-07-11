import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceSettingsProps {
  onSettingsChange?: (settings: VoiceSettingsData) => void;
}

export interface VoiceSettingsData {
  stability: number;
  similarityBoost: number;
  style: number;
  pitch: number;
  speed: number;
  tone: number;
  emphasis: number;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<VoiceSettingsData>({
    stability: 50,
    similarityBoost: 75,
    style: 30,
    pitch: 50,
    speed: 50,
    tone: 50,
    emphasis: 50,
  });

  const [expandedSection, setExpandedSection] = useState<string | null>('advanced');

  const handleSettingChange = (key: keyof VoiceSettingsData, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const settingGroups = {
    advanced: {
      title: 'Advanced Voice Settings',
      settings: [
        { 
          key: 'stability' as keyof VoiceSettingsData, 
          label: 'Stability', 
          description: 'Controls voice consistency and predictability',
          min: 0,
          max: 100,
        },
        { 
          key: 'similarityBoost' as keyof VoiceSettingsData, 
          label: 'Similarity Boost', 
          description: 'Enhances voice similarity to the original',
          min: 0,
          max: 100,
        },
        { 
          key: 'style' as keyof VoiceSettingsData, 
          label: 'Style Exaggeration', 
          description: 'Amplifies unique voice characteristics',
          min: 0,
          max: 100,
        },
      ],
    },
    basic: {
      title: 'Basic Voice Controls',
      settings: [
        { 
          key: 'pitch' as keyof VoiceSettingsData, 
          label: 'Pitch', 
          description: 'Voice frequency level',
          min: -50,
          max: 50,
        },
        { 
          key: 'speed' as keyof VoiceSettingsData, 
          label: 'Speed', 
          description: 'Speaking rate',
          min: 0,
          max: 100,
        },
        { 
          key: 'tone' as keyof VoiceSettingsData, 
          label: 'Tone', 
          description: 'Emotional coloring',
          min: 0,
          max: 100,
        },
        { 
          key: 'emphasis' as keyof VoiceSettingsData, 
          label: 'Emphasis', 
          description: 'Word stress intensity',
          min: 0,
          max: 100,
        },
      ],
    },
  };

  const presets = [
    { name: 'Natural', values: { stability: 75, similarityBoost: 75, style: 0 } },
    { name: 'Expressive', values: { stability: 30, similarityBoost: 50, style: 80 } },
    { name: 'Stable', values: { stability: 90, similarityBoost: 85, style: 10 } },
    { name: 'Creative', values: { stability: 20, similarityBoost: 40, style: 100 } },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const newSettings = { ...settings, ...preset.values };
    setSettings(newSettings);
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors text-sm"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Groups */}
      {Object.entries(settingGroups).map(([groupKey, group]) => (
        <motion.div
          key={groupKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="neural-card"
        >
          <button
            onClick={() => setExpandedSection(expandedSection === groupKey ? null : groupKey)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h4 className="text-lg font-semibold">{group.title}</h4>
            <motion.div
              animate={{ rotate: expandedSection === groupKey ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: expandedSection === groupKey ? 'auto' : 0,
              opacity: expandedSection === groupKey ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6">
              {group.settings.map(({ key, label, description, min, max }) => (
                <div key={key}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <label className="text-sm font-medium">{label}</label>
                      <p className="text-xs text-text-muted">{description}</p>
                    </div>
                    <span className="text-sm font-medium ml-4">
                      {settings[key]}{key === 'pitch' && settings[key] > 0 ? '+' : ''}{min < 0 ? '' : '%'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={settings[key]}
                      onChange={(e) => handleSettingChange(key, Number(e.target.value))}
                      className="w-full h-2 bg-neural-light rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                          ((settings[key] - min) / (max - min)) * 100
                        }%, #374151 ${((settings[key] - min) / (max - min)) * 100}%, #374151 100%)`,
                      }}
                    />
                    {/* Tick marks */}
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text-muted">{min}{min < 0 ? '' : '%'}</span>
                      <span className="text-xs text-text-muted">{max}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Reset Button */}
      <button
        onClick={() => {
          const defaultSettings: VoiceSettingsData = {
            stability: 50,
            similarityBoost: 75,
            style: 30,
            pitch: 50,
            speed: 50,
            tone: 50,
            emphasis: 50,
          };
          setSettings(defaultSettings);
          if (onSettingsChange) {
            onSettingsChange(defaultSettings);
          }
        }}
        className="w-full py-2 rounded-lg border border-electric-purple text-electric-purple hover:bg-electric-purple/10 transition-colors text-sm"
      >
        Reset to Defaults
      </button>
    </div>
  );
};

export default VoiceSettings;