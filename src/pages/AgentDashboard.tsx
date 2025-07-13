import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Rocket, TestTube, Download, Upload, Phone } from 'lucide-react';
import { ManagedAgent } from '../types/agent.types';
import { agentManagementService } from '../services/agentManagement.service';
import { useNavigate } from 'react-router-dom';

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<ManagedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<ManagedAgent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    const fetchedAgents = await agentManagementService.getAllAgents();
    setAgents(fetchedAgents);
    setLoading(false);
  };

  const handleImportPedroAgents = async () => {
    const imported = await agentManagementService.importPedroAgents();
    if (imported.length > 0) {
      await loadAgents();
    }
  };

  const handleCreateAgent = () => {
    navigate('/agents/create');
  };

  const handleConfigureAgent = (agent: ManagedAgent) => {
    navigate(`/agents/${agent.id}/configure`);
  };

  const handleTestAgent = (agent: ManagedAgent) => {
    navigate(`/agents/${agent.id}/test`);
  };

  const handleDeployAgent = async (agent: ManagedAgent) => {
    // TODO: Show deployment modal
    console.log('Deploy agent:', agent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500';
      case 'testing': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deployed': return 'Live';
      case 'testing': return 'Testing';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Agent Command Center
          </h1>
          <p className="text-gray-600">
            Manage, configure, and deploy AI agents to your client projects
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Agents</p>
                <p className="text-2xl font-bold text-gray-800">{agents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Deployed</p>
                <p className="text-2xl font-bold text-green-600">
                  {agents.filter(a => a.deployment.status === 'deployed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Testing</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {agents.filter(a => a.deployment.status === 'testing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Agents</p>
                <p className="text-2xl font-bold text-purple-600">
                  {agents.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateAgent}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Agent
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImportPedroAgents}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm hover:bg-purple-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Import Pedro Agents
          </motion.button>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Agents Yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first agent or import existing ones from the Pedro project
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCreateAgent}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Agent
              </button>
              <button
                onClick={handleImportPedroAgents}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Import Pedro Agents
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Agent Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.deployment.status)}`}></div>
                      <span className="text-xs text-gray-500">{getStatusText(agent.deployment.status)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Type:</span>
                      <span>{agent.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {agent.status}
                      </span>
                    </div>
                    {agent.voiceConfig.enabled && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>Voice: {agent.voiceConfig.voiceId || 'Default'}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {agent.description && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{agent.description}</p>
                    </div>
                  )}

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {agent.personality.language.map((lang) => (
                      <span key={lang} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Tags */}
                  {agent.tags && agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-xs text-blue-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agent Actions */}
                <div className="p-4 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => handleConfigureAgent(agent)}
                    className="flex-1 py-2 px-3 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Configure
                  </button>
                  <button
                    onClick={() => handleTestAgent(agent)}
                    className="flex-1 py-2 px-3 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <TestTube className="w-4 h-4" />
                    Test
                  </button>
                  <button
                    onClick={() => handleDeployAgent(agent)}
                    className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Rocket className="w-4 h-4" />
                    Deploy
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;