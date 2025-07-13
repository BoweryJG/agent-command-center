import React, { useState } from 'react';
import { Rocket, Globe, Shield, Clock, Check, AlertCircle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface Deployment {
  id: string;
  agentName: string;
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'pending' | 'failed';
  deployedAt: Date;
  version: string;
  endpoint: string;
}

const DeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      agentName: 'Julie',
      environment: 'production',
      status: 'active',
      deployedAt: new Date('2024-01-15'),
      version: 'v1.2.3',
      endpoint: 'https://pedro.com/api/agents/julie'
    },
    {
      id: '2',
      agentName: 'Harvey',
      environment: 'production',
      status: 'active',
      deployedAt: new Date('2024-01-14'),
      version: 'v1.2.2',
      endpoint: 'https://repconnect1.netlify.app/api/agents/harvey'
    },
    {
      id: '3',
      agentName: 'Brian',
      environment: 'staging',
      status: 'pending',
      deployedAt: new Date('2024-01-16'),
      version: 'v1.3.0-beta',
      endpoint: 'https://staging.pedro.com/api/agents/brian'
    }
  ]);

  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-green-100 text-green-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredDeployments = selectedEnvironment === 'all' 
    ? deployments 
    : deployments.filter(d => d.environment === selectedEnvironment);

  return (
    <div className="space-y-6">
      {/* Deployment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Rocket className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">{deployments.length}</span>
          </div>
          <p className="text-gray-500 text-sm">Total Deployments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-green-600">
              {deployments.filter(d => d.environment === 'production').length}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Production</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-600">
              {deployments.filter(d => d.environment === 'staging').length}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Staging</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Check className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">
              {deployments.filter(d => d.status === 'active').length}
            </span>
          </div>
          <p className="text-gray-500 text-sm">Active</p>
        </motion.div>
      </div>

      {/* Deployment Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Deployment Management</h2>
          <div className="flex gap-4">
            <select 
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              New Deployment
            </button>
          </div>
        </div>

        {/* Deployment List */}
        <div className="space-y-4">
          {filteredDeployments.map((deployment, index) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {deployment.agentName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800">{deployment.agentName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEnvironmentColor(deployment.environment)}`}>
                        {deployment.environment}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(deployment.status)}
                        <span className="text-xs text-gray-500">{deployment.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">Version: {deployment.version}</span>
                      <span className="text-sm text-gray-500">
                        Deployed: {deployment.deployedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    View Logs
                  </button>
                  {deployment.status === 'active' && (
                    <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Rollback
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{deployment.endpoint}</code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Deployment Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-600">Julie deployed to production</span>
            <span className="text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-gray-600">Brian deployment to staging pending</span>
            <span className="text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-gray-600">Harvey updated to v1.2.2</span>
            <span className="text-gray-400">1 day ago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeploymentManager;