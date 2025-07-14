import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  TestTube, 
  Rocket, 
  Trash2, 
  Volume2, 
  MessageSquare,
  MoreVertical,
  Activity,
  Globe,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { ManagedAgent } from '../../types/agent.types';

interface AgentCardProps {
  agent: ManagedAgent;
  onConfigure: (agent: ManagedAgent) => void;
  onTest: (agent: ManagedAgent) => void;
  onHear: (agent: ManagedAgent) => void;
  onInteract: (agent: ManagedAgent) => void;
  onDeploy: (agent: ManagedAgent) => void;
  onDelete: (agent: ManagedAgent) => void;
}

const statusConfig = {
  deployed: {
    label: 'Live',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <Activity className="w-3 h-3" />,
    pulse: true
  },
  testing: {
    label: 'Ready',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    icon: <Zap className="w-3 h-3" />,
    pulse: false
  },
  draft: {
    label: 'Draft',
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    icon: <Shield className="w-3 h-3" />,
    pulse: false
  }
};

const platformIcons: Record<string, JSX.Element> = {
  'Pedro': <span className="text-lg">📱</span>,
  'RepConnect1': <span className="text-lg">🏢</span>,
  'Web': <Globe className="w-4 h-4" />,
  'API': <span className="text-lg">🔌</span>
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onConfigure,
  onTest,
  onHear,
  onInteract,
  onDeploy,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const status = statusConfig[agent.deployment.status] || statusConfig.draft;
  
  // Mock deployment platforms - in real app, this would come from agent data
  const deploymentPlatforms = agent.deployment.status === 'deployed' 
    ? ['Pedro', 'RepConnect1'] 
    : [];

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-primary via-surface-secondary to-neural-light border border-neural-accent/20 hover:border-electric-blue/50 transition-all duration-500">
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${isHovered ? '50% 50%' : '0% 0%'}, rgba(59, 130, 246, 0.15) 0%, transparent 70%)`
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor} ${status.borderColor} border backdrop-blur-sm`}
            animate={status.pulse ? { 
              boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${status.color}`} />
            <span className="text-xs font-medium text-text-secondary">{status.label}</span>
          </motion.div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 pb-0">
          <div className="flex items-start gap-4">
            {/* Agent Avatar */}
            <motion.div 
              className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-electric-blue via-electric-purple to-electric-pink p-0.5"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-full rounded-xl bg-surface-primary flex items-center justify-center text-2xl font-bold text-text-primary">
                {agent.name.charAt(0).toUpperCase()}
              </div>
            </motion.div>

            {/* Agent Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">{agent.name}</h3>
              <p className="text-sm text-text-muted capitalize">{agent.type}</p>
            </div>

            {/* More Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-text-muted" />
              </button>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-secondary border border-neural-accent/20 shadow-lg z-20"
                >
                  <button
                    onClick={() => onDelete(agent)}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Agent
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm text-text-secondary line-clamp-2">
            {agent.description || 'No description available'}
          </p>

          {/* Deployment Platforms */}
          {deploymentPlatforms.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-text-muted">Deployed on:</span>
              <div className="flex gap-2">
                {deploymentPlatforms.map((platform) => (
                  <motion.div
                    key={platform}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-electric-blue/10 border border-electric-blue/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    {platformIcons[platform] || <Globe className="w-3 h-3" />}
                    <span className="text-xs text-electric-blue">{platform}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-electric-blue">{agent.analytics.totalInteractions}</p>
              <p className="text-xs text-text-muted">Interactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-electric-purple">{agent.analytics.successRate}%</p>
              <p className="text-xs text-text-muted">Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-electric-cyan">{agent.analytics.avgResponseTime}s</p>
              <p className="text-xs text-text-muted">Avg Response</p>
            </div>
          </div>

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {agent.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 text-xs rounded-lg bg-neural-accent/20 text-text-secondary border border-neural-accent/10"
                >
                  {tag}
                </span>
              ))}
              {agent.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-text-muted">
                  +{agent.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Actions */}
            <motion.button
              onClick={() => onConfigure(agent)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neural-accent/20 hover:bg-neural-accent/30 border border-neural-accent/20 hover:border-electric-blue/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-4 h-4 text-text-secondary group-hover:text-electric-blue transition-colors" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-electric-blue transition-colors">Configure</span>
            </motion.button>

            <motion.button
              onClick={() => onTest(agent)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neural-accent/20 hover:bg-neural-accent/30 border border-neural-accent/20 hover:border-electric-purple/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TestTube className="w-4 h-4 text-text-secondary group-hover:text-electric-purple transition-colors" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-electric-purple transition-colors">Test</span>
            </motion.button>

            {/* Secondary Actions */}
            <motion.button
              onClick={() => onHear(agent)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neural-accent/20 hover:bg-neural-accent/30 border border-neural-accent/20 hover:border-electric-cyan/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!agent.voiceConfig.enabled}
            >
              <Volume2 className={`w-4 h-4 ${agent.voiceConfig.enabled ? 'text-text-secondary group-hover:text-electric-cyan' : 'text-text-muted opacity-50'} transition-colors`} />
              <span className={`text-sm font-medium ${agent.voiceConfig.enabled ? 'text-text-secondary group-hover:text-electric-cyan' : 'text-text-muted opacity-50'} transition-colors`}>Hear</span>
            </motion.button>

            <motion.button
              onClick={() => onInteract(agent)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-neural-accent/20 hover:bg-neural-accent/30 border border-neural-accent/20 hover:border-electric-pink/30 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-4 h-4 text-text-secondary group-hover:text-electric-pink transition-colors" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-electric-pink transition-colors">Interact</span>
            </motion.button>
          </div>

          {/* Deploy Button */}
          <motion.button
            onClick={() => onDeploy(agent)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-electric-blue to-electric-purple hover:from-electric-purple hover:to-electric-pink text-white font-medium transition-all duration-300 shadow-lg hover:shadow-neural"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Rocket className="w-4 h-4" />
            <span>Deploy Agent</span>
          </motion.button>
        </div>

        {/* Last Active Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
};

export default AgentCard;