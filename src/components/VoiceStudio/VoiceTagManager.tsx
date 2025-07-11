import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface VoiceTagManagerProps {
  voiceId: string;
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const VoiceTagManager: React.FC<VoiceTagManagerProps> = ({
  voiceId,
  initialTags = [],
  onTagsChange,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const availableTags: Tag[] = [
    { id: 'professional', name: 'Professional', color: 'from-blue-400 to-blue-600', count: 45 },
    { id: 'friendly', name: 'Friendly', color: 'from-green-400 to-green-600', count: 38 },
    { id: 'energetic', name: 'Energetic', color: 'from-yellow-400 to-orange-400', count: 32 },
    { id: 'calm', name: 'Calm', color: 'from-purple-400 to-purple-600', count: 28 },
    { id: 'authoritative', name: 'Authoritative', color: 'from-red-400 to-red-600', count: 24 },
    { id: 'warm', name: 'Warm', color: 'from-pink-400 to-pink-600', count: 22 },
    { id: 'technical', name: 'Technical', color: 'from-gray-400 to-gray-600', count: 18 },
    { id: 'conversational', name: 'Conversational', color: 'from-teal-400 to-teal-600', count: 16 },
  ];

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    if (onTagsChange) {
      onTagsChange(newTags);
    }
  };

  const addCustomTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.toLowerCase())) {
      const tagId = newTag.toLowerCase().replace(/\s+/g, '-');
      const newTags = [...selectedTags, tagId];
      setSelectedTags(newTags);
      if (onTagsChange) {
        onTagsChange(newTags);
      }
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Voice Tags</h4>
        <button
          onClick={() => setIsAddingTag(!isAddingTag)}
          className="text-sm text-electric-purple hover:text-electric-pink transition-colors"
        >
          + Add Custom Tag
        </button>
      </div>

      {/* Custom Tag Input */}
      <AnimatePresence>
        {isAddingTag && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                placeholder="Enter custom tag..."
                className="flex-1 px-3 py-2 rounded-lg bg-neural-light border border-transparent focus:border-electric-purple focus:outline-none text-sm"
              />
              <button
                onClick={addCustomTag}
                className="px-4 py-2 rounded-lg bg-electric-purple text-white hover:bg-electric-purple/80 transition-colors text-sm"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingTag(false);
                  setNewTag('');
                }}
                className="px-4 py-2 rounded-lg bg-neural-light hover:bg-neural-accent/20 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <motion.button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'text-white'
                  : 'bg-neural-light hover:bg-neural-accent/20'
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(to right, ${tag.color.split(' ')[1]} 0%, ${tag.color.split(' ')[3]} 100%)`
                  : undefined,
              }}
            >
              <span className="flex items-center gap-1">
                {tag.name}
                <span className="text-xs opacity-70">({tag.count})</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-neural-light rounded-lg"
        >
          <p className="text-sm text-text-muted mb-2">Selected tags:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = availableTags.find((t) => t.id === tagId);
              return (
                <div
                  key={tagId}
                  className="flex items-center gap-1 px-2 py-1 bg-neural-darker rounded-full text-xs"
                >
                  <span>{tag?.name || tagId}</span>
                  <button
                    onClick={() => toggleTag(tagId)}
                    className="ml-1 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceTagManager;