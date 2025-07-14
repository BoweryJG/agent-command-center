import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Rocket, TestTube, Download, Upload, Phone, Grid, List, Filter, Search, RefreshCw, Cloud } from 'lucide-react';
import { ManagedAgent } from '../types/agent.types';
import { agentManagementService } from '../services/agentManagement.service';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AgentCard } from '../components/Agent/AgentCard';
import { TestAgentModal } from '../components/Agent/TestAgentModal';
import { InteractAgentModal } from '../components/Agent/InteractAgentModal';
import { VoicePreviewModal } from '../components/Agent/VoicePreviewModal';

const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<ManagedAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<ManagedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<ManagedAgent | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  
  // Modal states
  const [testModalAgent, setTestModalAgent] = useState<ManagedAgent | null>(null);
  const [interactModalAgent, setInteractModalAgent] = useState<ManagedAgent | null>(null);
  const [voicePreviewAgent, setVoicePreviewAgent] = useState<ManagedAgent | null>(null);
  const [showVoiceFromInteract, setShowVoiceFromInteract] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, filterCategory, filterStatus]);

  const loadAgents = async () => {
    setLoading(true);
    const fetchedAgents = await agentManagementService.getAllAgents();
    setAgents(fetchedAgents);
    setFilteredAgents(fetchedAgents);
    setLoading(false);
  };

  const syncFromAgentBackend = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'https://agentbackend-2932.onrender.com';
      const response = await axios.get(`${apiUrl}/api/agent-sync/sync-from-backend`);
      
      if (response.data.success) {
        const syncedAgents = response.data.agents;
        
        // Import each agent to local storage for configuration
        let importCount = 0;
        let errorCount = 0;
        
        for (const agent of syncedAgents) {
          try {
            // Check if agent already exists
            const exists = agents.find(a => a.id === agent.id);
            if (!exists) {
              // Import agent to local system
              const createdAgent = await agentManagementService.createAgent({
                ...agent,
                source: 'agent-backend',
                imported_at: new Date().toISOString(),
                deployment_status: 'not_deployed'
              } as any);
              
              if (createdAgent) {
                importCount++;
              } else {
                errorCount++;
              }
            }
          } catch (err) {
            console.error(`Failed to import agent ${agent.name}:`, err);
            errorCount++;
          }
        }
        
        // Show results with more detailed feedback
        const message = [
          'Agent Backend Sync Complete!',
          '',
          `Total agents found: ${syncedAgents.length}`,
          `Already existed: ${syncedAgents.length - importCount - errorCount}`,
          `Newly imported: ${importCount}`,
          errorCount > 0 ? `Failed to import: ${errorCount}` : '',
          '',
          'You can now configure and deploy these agents to Pedro or RepConnect1.'
        ].filter(Boolean).join('\n');
        
        alert(message);
        
        // Reload agents to show updated list
        await loadAgents();
      } else {
        throw new Error(response.data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Failed to sync from agent backend:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to sync agents from central backend.';
      
      if (error.response?.status === 404) {
        errorMessage += '\n\nThe sync endpoint was not found. Make sure you have the latest backend version.';
      } else if (error.response?.status >= 500) {
        errorMessage += '\n\nThe backend server encountered an error. Please try again later.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage += '\n\nCould not connect to the backend. Make sure it is running and accessible.';
      } else if (error.response?.data?.error) {
        errorMessage += `\n\n${error.response.data.error}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPedroAgents = async () => {
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'https://agentbackend-2932.onrender.com';
      const response = await axios.get(`${apiUrl}/api/agent-sync/pedro-agents`);
      
      if (response.data.success) {
        const pedroAgents = response.data.agents;
        const message = [
          `Pedro currently has ${pedroAgents.length}/${response.data.maxAgents} agents:`,
          '',
          ...pedroAgents.map((a: any) => `• ${a.name}`)
        ].join('\n');
        
        alert(message);
      } else {
        throw new Error(response.data.error || 'Failed to fetch agents');
      }
    } catch (error: any) {
      console.error('Failed to get Pedro agents:', error);
      
      let errorMessage = 'Failed to fetch Pedro\'s agents.';
      
      if (error.response?.status === 404) {
        errorMessage += '\n\nThe Pedro agents endpoint was not found.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage += '\n\nPedro backend may be offline or unreachable.';
      } else if (error.response?.data?.error) {
        errorMessage += `\n\n${error.response.data.error}`;
      }
      
      alert(errorMessage);
    }
  };

  const filterAgents = () => {
    let filtered = agents;
    
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(agent => agent.type === filterCategory);
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === filterStatus);
    }
    
    setFilteredAgents(filtered);
  };

  const getAgentCategories = () => {
    const categories = new Set(agents.map(agent => agent.type));
    return Array.from(categories);
  };

  const handleImportPedroAgents = async () => {
    const imported = await agentManagementService.importPedroAgents();
    if (imported.length > 0) {
      await loadAgents();
    }
  };

  const handleCreateAgent = () => {
    // Redirect to Agent Backend to create agents
    window.open('https://agentbackend-2932.onrender.com/agents/create', '_blank');
    alert('Create your agent on the Agent Backend.\n\nAfter creating, use "Sync from Agent Backend" to import it here for configuration and deployment.');
  };

  const handleConfigureAgent = (agent: ManagedAgent) => {
    navigate(`/agents/${agent.id}/configure`);
  };

  const handleTestAgent = (agent: ManagedAgent) => {
    setTestModalAgent(agent);
  };

  const handleDeployAgent = async (agent: ManagedAgent) => {
    const platform = prompt('Deploy to which platform?\n\n1. Pedro (max 5 agents)\n2. RepConnect1\n\nEnter 1 or 2:');
    
    if (!platform || !['1', '2'].includes(platform)) {
      return; // User cancelled or entered invalid option
    }
    
    const apiUrl = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || 'https://agentbackend-2932.onrender.com';
    const platformName = platform === '1' ? 'Pedro' : 'RepConnect1';
    const endpoint = platform === '1' ? 'deploy-to-pedro' : 'deploy-to-repconnect1';
    
    // Show loading state
    const loadingMessage = `Deploying ${agent.name} to ${platformName}...`;
    console.log(loadingMessage);
    
    try {
      const response = await axios.post(`${apiUrl}/api/agent-sync/${endpoint}/${agent.id}`);
      
      if (response.data.success) {
        alert(`Successfully deployed ${agent.name} to ${platformName}!`);
        await loadAgents();
      } else {
        throw new Error(response.data.error || 'Deployment failed');
      }
    } catch (error: any) {
      console.error(`Failed to deploy to ${platformName}:`, error);
      
      let errorMessage = `Failed to deploy to ${platformName}`;
      
      if (error.response?.status === 404) {
        errorMessage += '\n\nThe deployment endpoint was not found. Make sure you have the latest backend version.';
      } else if (error.response?.status === 409) {
        errorMessage += '\n\nThis agent may already be deployed or there is a conflict.';
      } else if (error.response?.data?.details) {
        errorMessage += `\n\n${error.response.data.details}`;
      } else if (error.response?.data?.error) {
        errorMessage += `\n\n${error.response.data.error}`;
      } else if (error.message) {
        errorMessage += `\n\n${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleHearAgent = (agent: ManagedAgent) => {
    if (agent.voiceConfig.enabled) {
      setVoicePreviewAgent(agent);
      setShowVoiceFromInteract(false);
    } else {
      alert('Voice is not enabled for this agent. Configure voice settings first.');
    }
  };

  const handleInteractAgent = (agent: ManagedAgent) => {
    setInteractModalAgent(agent);
  };
  
  const handleVoicePreviewFromInteract = () => {
    if (interactModalAgent) {
      setVoicePreviewAgent(interactModalAgent);
      setShowVoiceFromInteract(true);
    }
  };

  const handleDeleteAgent = async (agent: ManagedAgent) => {
    if (window.confirm(`Are you sure you want to delete ${agent.name}?`)) {
      await agentManagementService.deleteAgent(agent.id);
      await loadAgents();
    }
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
    <div className="min-h-screen bg-gradient-to-br from-neural-dark via-neural-darker to-neural-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2 glow-text">
              Agent Command Center
            </h1>
            <p className="text-text-secondary">
              Manage, configure, and deploy AI agents to your client projects
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={syncFromAgentBackend}
              className="neural-button flex items-center gap-2"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Cloud className="w-4 h-4" />
              Sync from Agent Backend
            </motion.button>
            <motion.button
              onClick={getPedroAgents}
              className="px-4 py-3 rounded-lg bg-gradient-to-r from-electric-purple to-electric-pink hover:from-electric-pink hover:to-electric-purple text-white font-medium flex items-center gap-2 transition-all duration-300 hover:shadow-neural"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-4 h-4" />
              Check Pedro's Agents
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="neural-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Agents</p>
                <p className="text-2xl font-bold text-text-primary">{agents.length}</p>
              </div>
              <div className="w-12 h-12 bg-electric-blue/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="neural-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Deployed</p>
                <p className="text-2xl font-bold text-green-400">
                  {agents.filter(a => a.deployment.status === 'deployed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="neural-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">In Testing</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {agents.filter(a => a.deployment.status === 'testing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <TestTube className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="neural-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Active Agents</p>
                <p className="text-2xl font-bold text-electric-purple">
                  {agents.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-electric-purple/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="neural-card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search agents by name, description, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary"
              >
                <option value="all">All Categories</option>
                {getAgentCategories().map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg hover:border-electric-blue/50 hover:bg-neural-accent/20 transition-all duration-300 text-text-secondary hover:text-electric-blue"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>

              <button
                onClick={loadAgents}
                className="p-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg hover:border-electric-purple/50 hover:bg-neural-accent/20 transition-all duration-300 text-text-secondary hover:text-electric-purple"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-text-muted">Active filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm flex items-center gap-1 border border-electric-blue/30">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1">×</button>
                </span>
              )}
              {filterCategory !== 'all' && (
                <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm flex items-center gap-1 border border-electric-blue/30">
                  Category: {filterCategory}
                  <button onClick={() => setFilterCategory('all')} className="ml-1">×</button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-sm flex items-center gap-1 border border-electric-blue/30">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus('all')} className="ml-1">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateAgent}
            className="neural-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Agent
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImportPedroAgents}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-electric-purple to-electric-pink hover:from-electric-pink hover:to-electric-purple text-white font-medium flex items-center gap-2 transition-all duration-300 hover:shadow-neural"
          >
            <Download className="w-5 h-5" />
            Import Pedro Agents
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadAgents}
            className="px-6 py-3 rounded-lg bg-neural-accent/30 hover:bg-neural-accent/50 text-text-primary font-medium flex items-center gap-2 transition-all duration-300 border border-neural-accent/20 hover:border-electric-cyan/30"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh from Backend
          </motion.button>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto"></div>
            <p className="text-text-muted mt-4">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="neural-card p-12 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-electric-blue/20 to-electric-purple/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-electric-blue/30">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Agents Yet</h3>
            <p className="text-text-secondary mb-6">
              Create your first agent or import existing ones from the Pedro project
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={handleCreateAgent}
                className="neural-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Agent
              </motion.button>
              <motion.button
                onClick={handleImportPedroAgents}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-electric-purple to-electric-pink hover:from-electric-pink hover:to-electric-purple text-white font-medium transition-all duration-300 hover:shadow-neural"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Import Pedro Agents
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <AgentCard
                  agent={agent}
                  onConfigure={handleConfigureAgent}
                  onTest={handleTestAgent}
                  onHear={handleHearAgent}
                  onInteract={handleInteractAgent}
                  onDeploy={handleDeployAgent}
                  onDelete={handleDeleteAgent}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modals */}
      <TestAgentModal
        isOpen={!!testModalAgent}
        onClose={() => setTestModalAgent(null)}
        agent={testModalAgent}
      />
      
      <InteractAgentModal
        isOpen={!!interactModalAgent}
        onClose={() => setInteractModalAgent(null)}
        agent={interactModalAgent}
        onVoicePreview={handleVoicePreviewFromInteract}
      />
      
      <VoicePreviewModal
        isOpen={!!voicePreviewAgent}
        onClose={() => {
          setVoicePreviewAgent(null);
          if (showVoiceFromInteract) {
            setShowVoiceFromInteract(false);
          }
        }}
        agent={voicePreviewAgent}
      />
    </div>
  );
};

export default AgentDashboard;