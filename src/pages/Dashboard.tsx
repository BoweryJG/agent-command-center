import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard: React.FC = () => {
  // Sample data
  const performanceData = [
    { time: '00:00', value: 65 },
    { time: '04:00', value: 72 },
    { time: '08:00', value: 85 },
    { time: '12:00', value: 91 },
    { time: '16:00', value: 88 },
    { time: '20:00', value: 75 },
    { time: '24:00', value: 70 },
  ];

  const agentMetrics = [
    { name: 'Active', value: 12, color: '#3B82F6' },
    { name: 'Training', value: 5, color: '#8B5CF6' },
    { name: 'Idle', value: 3, color: '#EC4899' },
  ];

  const stats = [
    { label: 'Total Agents', value: '20', change: '+12%', icon: '🤖' },
    { label: 'Active Sessions', value: '156', change: '+23%', icon: '💬' },
    { label: 'Success Rate', value: '94.2%', change: '+5.1%', icon: '📈' },
    { label: 'Avg Response', value: '1.2s', change: '-15%', icon: '⚡' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-blue to-electric-purple bg-clip-text text-transparent">
          Neural Dashboard
        </h1>
        <p className="text-text-secondary mt-2">
          Real-time monitoring and analytics for your AI agents
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="neural-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change} from last week
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="neural-card"
        >
          <h3 className="text-xl font-semibold mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="neural-card"
        >
          <h3 className="text-xl font-semibold mb-4">Agent Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agentMetrics}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {agentMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="neural-card"
      >
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { agent: 'Harvey', action: 'Completed voice synthesis', time: '2 mins ago', status: 'success' },
            { agent: 'Synthia', action: 'Started training session', time: '5 mins ago', status: 'info' },
            { agent: 'Echo', action: 'Generated personality profile', time: '12 mins ago', status: 'success' },
            { agent: 'Nova', action: 'Failed connection attempt', time: '18 mins ago', status: 'error' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-neural-light/50 hover:bg-neural-light transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                }`} />
                <div>
                  <p className="font-medium">{activity.agent}</p>
                  <p className="text-sm text-text-muted">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-text-muted">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;