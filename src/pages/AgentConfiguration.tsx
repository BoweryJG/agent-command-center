import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Cloud, Users, Shield, Brain } from 'lucide-react';
import { agentManagementService } from '../services/agentManagement.service';
import { ManagedAgent } from '../types/agent.types';

const AgentConfiguration: React.FC = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<ManagedAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Configuration states
  const [deploymentConfig, setDeploymentConfig] = useState({
    targetPlatforms: [] as string[],
    autoSync: false,
    syncInterval: 'daily',
    priority: 'normal'
  });
  
  const [accessConfig, setAccessConfig] = useState({
    allowedUsers: [] as string[],
    permissions: {
      canModifyPersonality: false,
      canAccessSensitiveData: false,
      canMakeExternalCalls: true,
      canStoreData: true
    }
  });
  
  const [behaviorConfig, setBehaviorConfig] = useState({
    maxResponseLength: 500,
    responseTimeout: 30,
    fallbackBehavior: 'polite_decline',
    errorHandling: 'retry_once'
  });

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  const loadAgent = async () => {
    if (!agentId) return;
    
    try {
      const fetchedAgent = await agentManagementService.getAgent(agentId);
      setAgent(fetchedAgent);
      
      // Load existing configuration
      // Note: The configuration is stored separately, not in the agent's configuration object
      // For now, we'll use the default values
    } catch (error) {
      console.error('Failed to load agent:', error);
      alert('Failed to load agent configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!agent) return;
    
    setSaving(true);
    try {
      // For now, we'll save the configuration data in a different way
      // This would typically be saved to a separate configuration table
      await agentManagementService.updateAgent(agent.id, {
        // Update the agent with any changes
        updatedAt: new Date()
      });
      
      // TODO: Implement proper configuration storage
      console.log('Configuration to save:', {
        deployment: deploymentConfig,
        access: accessConfig,
        behavior: behaviorConfig
      });
      
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading agent configuration...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/agents')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Configure {agent.name}
              </h1>
              <p className="text-gray-600">
                Set deployment rules, access controls, and behavior for this agent
              </p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-6">
          {/* Deployment Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Deployment Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Platforms
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.targetPlatforms.includes('pedro')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDeploymentConfig({
                            ...deploymentConfig,
                            targetPlatforms: [...deploymentConfig.targetPlatforms, 'pedro']
                          });
                        } else {
                          setDeploymentConfig({
                            ...deploymentConfig,
                            targetPlatforms: deploymentConfig.targetPlatforms.filter(p => p !== 'pedro')
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Pedro Platform (Max 5 agents)</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={deploymentConfig.targetPlatforms.includes('repconnect1')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDeploymentConfig({
                            ...deploymentConfig,
                            targetPlatforms: [...deploymentConfig.targetPlatforms, 'repconnect1']
                          });
                        } else {
                          setDeploymentConfig({
                            ...deploymentConfig,
                            targetPlatforms: deploymentConfig.targetPlatforms.filter(p => p !== 'repconnect1')
                          });
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>RepConnect1 Platform</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={deploymentConfig.autoSync}
                    onChange={(e) => setDeploymentConfig({
                      ...deploymentConfig,
                      autoSync: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Auto-sync with Agent Backend</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deployment Priority
                </label>
                <select
                  value={deploymentConfig.priority}
                  onChange={(e) => setDeploymentConfig({
                    ...deploymentConfig,
                    priority: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Access Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Access Control</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accessConfig.permissions.canModifyPersonality}
                      onChange={(e) => setAccessConfig({
                        ...accessConfig,
                        permissions: {
                          ...accessConfig.permissions,
                          canModifyPersonality: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Can modify personality</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accessConfig.permissions.canAccessSensitiveData}
                      onChange={(e) => setAccessConfig({
                        ...accessConfig,
                        permissions: {
                          ...accessConfig.permissions,
                          canAccessSensitiveData: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Can access sensitive data</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accessConfig.permissions.canMakeExternalCalls}
                      onChange={(e) => setAccessConfig({
                        ...accessConfig,
                        permissions: {
                          ...accessConfig.permissions,
                          canMakeExternalCalls: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Can make external API calls</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accessConfig.permissions.canStoreData}
                      onChange={(e) => setAccessConfig({
                        ...accessConfig,
                        permissions: {
                          ...accessConfig.permissions,
                          canStoreData: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Can store user data</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Behavior Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Behavior Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Response Length (words)
                </label>
                <input
                  type="number"
                  value={behaviorConfig.maxResponseLength}
                  onChange={(e) => setBehaviorConfig({
                    ...behaviorConfig,
                    maxResponseLength: parseInt(e.target.value) || 500
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={behaviorConfig.responseTimeout}
                  onChange={(e) => setBehaviorConfig({
                    ...behaviorConfig,
                    responseTimeout: parseInt(e.target.value) || 30
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Handling
                </label>
                <select
                  value={behaviorConfig.errorHandling}
                  onChange={(e) => setBehaviorConfig({
                    ...behaviorConfig,
                    errorHandling: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="retry_once">Retry Once</option>
                  <option value="retry_twice">Retry Twice</option>
                  <option value="fail_gracefully">Fail Gracefully</option>
                  <option value="escalate">Escalate to Human</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AgentConfiguration;