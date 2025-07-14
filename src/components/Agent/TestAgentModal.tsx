import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, CheckCircle, AlertCircle, Loader, Copy, RotateCcw } from 'lucide-react';
import { ManagedAgent } from '../../types/agent.types';
import { agentManagementService } from '../../services/agentManagement.service';

interface TestAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: ManagedAgent | null;
}

interface TestResult {
  response: string;
  responseTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export const TestAgentModal: React.FC<TestAgentModalProps> = ({
  isOpen,
  onClose,
  agent
}) => {
  const [testMessage, setTestMessage] = useState('');
  const [contextFields, setContextFields] = useState<Record<string, string>>({
    user_name: '',
    user_role: '',
    scenario: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);

  if (!agent) return null;

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await agentManagementService.testAgent(agent.id, {
        message: testMessage,
        context: contextFields
      });

      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        response: response.response,
        responseTime,
        timestamp: new Date(),
        success: true
      };

      setTestResult(result);
      setTestHistory(prev => [result, ...prev.slice(0, 4)]);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: TestResult = {
        response: error.response?.data?.error || 'Failed to get response from agent',
        responseTime,
        timestamp: new Date(),
        success: false,
        error: error.message
      };

      setTestResult(result);
      setTestHistory(prev => [result, ...prev.slice(0, 4)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (testResult) {
      navigator.clipboard.writeText(testResult.response);
    }
  };

  const handleReset = () => {
    setTestMessage('');
    setContextFields({
      user_name: '',
      user_role: '',
      scenario: ''
    });
    setTestResult(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-3xl bg-gradient-to-br from-surface-primary via-surface-secondary to-neural-light rounded-2xl shadow-2xl border border-neural-accent/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-neural-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue to-electric-purple p-0.5">
                    <div className="w-full h-full rounded-xl bg-surface-primary flex items-center justify-center text-lg font-bold text-text-primary">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">Test {agent.name}</h2>
                    <p className="text-sm text-text-muted">Send test messages and evaluate responses</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Context Fields */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Context (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={contextFields.user_name}
                      onChange={(e) => setContextFields(prev => ({ ...prev, user_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      User Role
                    </label>
                    <input
                      type="text"
                      value={contextFields.user_role}
                      onChange={(e) => setContextFields(prev => ({ ...prev, user_role: e.target.value }))}
                      className="w-full px-3 py-2 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted"
                      placeholder="Customer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Scenario
                    </label>
                    <input
                      type="text"
                      value={contextFields.scenario}
                      onChange={(e) => setContextFields(prev => ({ ...prev, scenario: e.target.value }))}
                      className="w-full px-3 py-2 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted"
                      placeholder="Support request"
                    />
                  </div>
                </div>
              </div>

              {/* Test Message */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">Test Message</h3>
                <div className="relative">
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Type your test message here..."
                    className="w-full px-4 py-3 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted resize-none"
                    rows={4}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      onClick={handleTest}
                      disabled={!testMessage.trim() || isLoading}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-electric-blue to-electric-purple hover:from-electric-purple hover:to-electric-pink text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Test
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-text-primary">Response</h3>
                  
                  {/* Metrics */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`font-medium ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                        {testResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{testResult.responseTime}ms</span>
                    </div>
                    <div className="text-sm text-text-muted">
                      {testResult.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Response Content */}
                  <div className="relative">
                    <div className="p-4 bg-neural-light/30 border border-neural-accent/20 rounded-lg">
                      <p className="text-text-primary whitespace-pre-wrap">{testResult.response}</p>
                      {testResult.error && (
                        <p className="mt-2 text-sm text-red-400">Error: {testResult.error}</p>
                      )}
                    </div>
                    <button
                      onClick={handleCopyResponse}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-neural-light/50 hover:bg-neural-accent/30 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Test History */}
              {testHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Recent Tests</h3>
                  <div className="space-y-2">
                    {testHistory.map((test, index) => (
                      <div
                        key={index}
                        className="p-3 bg-neural-light/20 border border-neural-accent/10 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            {test.success ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-sm text-text-secondary">
                              {test.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="text-sm text-text-muted">{test.responseTime}ms</span>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary truncate">
                          {test.response}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TestAgentModal;