import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cloud, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
}

const SystemHealth: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'AgentBackend API',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 124,
      lastChecked: new Date()
    },
    {
      name: 'Pedro Frontend',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 89,
      lastChecked: new Date()
    },
    {
      name: 'RepConnect1',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 156,
      lastChecked: new Date()
    },
    {
      name: 'OSBackend',
      status: 'warning',
      uptime: 98.5,
      responseTime: 342,
      lastChecked: new Date()
    },
    {
      name: 'Supabase Database',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 45,
      lastChecked: new Date()
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 200) return 'text-green-600';
    if (time < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' : 
                       services.some(s => s.status === 'error') ? 'error' : 'warning';

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">System Health Overview</h2>
          <div className={`px-4 py-2 rounded-lg ${getStatusColor(overallHealth)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              <span className="font-medium capitalize">{overallHealth}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-800">{services.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Healthy Services</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.status === 'healthy').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(services.reduce((acc, s) => acc + s.responseTime, 0) / services.length)}ms
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-500">
                  Last checked: {service.lastChecked.toLocaleTimeString()}
                </p>
              </div>
              {getStatusIcon(service.status)}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Uptime</span>
                  <span className={`font-medium ${getUptimeColor(service.uptime)}`}>
                    {service.uptime}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      service.uptime >= 99.9 ? 'bg-green-500' :
                      service.uptime >= 99 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${service.uptime}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Response Time</span>
                  <span className={`font-medium ${getResponseTimeColor(service.responseTime)}`}>
                    {service.responseTime}ms
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      service.responseTime < 200 ? 'bg-green-500' :
                      service.responseTime < 500 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((service.responseTime / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                {service.status.toUpperCase()}
              </span>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View Details →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Alerts */}
      {services.some(s => s.status !== 'healthy') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Active Alerts</h3>
          </div>
          <div className="space-y-2">
            {services.filter(s => s.status !== 'healthy').map(service => (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-yellow-700">{service.name}: {service.status}</span>
                <button className="text-sm text-yellow-600 hover:text-yellow-700">
                  Investigate →
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SystemHealth;