import React from 'react';
import { TrendingUp, Users, MessageSquare, Clock, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentMetric {
  agentName: string;
  interactions: number;
  successRate: number;
  avgResponseTime: number;
  satisfaction: number;
}

const Analytics: React.FC = () => {
  const metrics: AgentMetric[] = [
    { agentName: 'Julie', interactions: 2847, successRate: 96.5, avgResponseTime: 1.2, satisfaction: 4.8 },
    { agentName: 'Brian', interactions: 1923, successRate: 94.2, avgResponseTime: 1.5, satisfaction: 4.7 },
    { agentName: 'Maria', interactions: 1654, successRate: 97.8, avgResponseTime: 0.9, satisfaction: 4.9 },
    { agentName: 'Harvey', interactions: 3421, successRate: 92.1, avgResponseTime: 1.8, satisfaction: 4.5 },
    { agentName: 'Dr. Pedro', interactions: 892, successRate: 98.9, avgResponseTime: 2.1, satisfaction: 4.9 },
  ];

  const totalInteractions = metrics.reduce((sum, m) => sum + m.interactions, 0);
  const avgSuccessRate = metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
  const avgResponseTime = metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length;
  const avgSatisfaction = metrics.reduce((sum, m) => sum + m.satisfaction, 0) / metrics.length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <span className="text-sm text-green-600 font-medium">+12.5%</span>
          </div>
          <p className="text-gray-500 text-sm">Total Interactions</p>
          <p className="text-3xl font-bold text-gray-800">{totalInteractions.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-500" />
            <span className="text-sm text-green-600 font-medium">+2.3%</span>
          </div>
          <p className="text-gray-500 text-sm">Success Rate</p>
          <p className="text-3xl font-bold text-gray-800">{avgSuccessRate.toFixed(1)}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-red-600 font-medium">-0.3s</span>
          </div>
          <p className="text-gray-500 text-sm">Avg Response Time</p>
          <p className="text-3xl font-bold text-gray-800">{avgResponseTime.toFixed(1)}s</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-yellow-500" />
            <span className="text-sm text-green-600 font-medium">+0.2</span>
          </div>
          <p className="text-gray-500 text-sm">User Satisfaction</p>
          <p className="text-3xl font-bold text-gray-800">{avgSatisfaction.toFixed(1)}/5</p>
        </motion.div>
      </div>

      {/* Agent Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Agent Performance</h2>
          <div className="flex items-center gap-4">
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Export Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Agent</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium">Interactions</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium">Success Rate</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium">Avg Response</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium">Satisfaction</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={metric.agentName} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {metric.agentName.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{metric.agentName}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800">
                    {metric.interactions.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-medium ${
                      metric.successRate >= 95 ? 'text-green-600' :
                      metric.successRate >= 90 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.successRate}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-medium ${
                      metric.avgResponseTime <= 1.5 ? 'text-green-600' :
                      metric.avgResponseTime <= 2.0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {metric.avgResponseTime}s
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium text-gray-800">{metric.satisfaction}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interactions by Category</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Healthcare</span>
                <span className="font-medium text-gray-800">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Sales</span>
                <span className="font-medium text-gray-800">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Support</span>
                <span className="font-medium text-gray-800">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Usage Hours</h3>
          <div className="flex items-end justify-between h-32">
            {[40, 60, 80, 95, 100, 85, 70, 50, 65, 85, 90, 75].map((height, index) => (
              <div key={index} className="flex-1 mx-1">
                <div
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {index * 2}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">Hours (24h format)</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;