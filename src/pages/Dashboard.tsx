import React, { useState } from 'react';
import { Bot, Activity, BarChart3, Rocket } from 'lucide-react';
import AgentDashboard from './AgentDashboard';
import SystemHealth from '../components/Dashboard/SystemHealth';
import Analytics from '../components/Dashboard/Analytics';
import DeploymentManager from '../components/Dashboard/DeploymentManager';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'health' | 'analytics' | 'deployments'>('agents');

  const tabs = [
    { id: 'agents', label: 'Agents', icon: Bot, component: AgentDashboard },
    { id: 'health', label: 'System Health', icon: Activity, component: SystemHealth },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: Analytics },
    { id: 'deployments', label: 'Deployments', icon: Rocket, component: DeploymentManager }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AgentDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Agent Command Center</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your AI agent ecosystem</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">29 Agents Online</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 transition-colors
                    ${activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveComponent />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;