import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Volume2, Loader, User, Bot, MoreVertical, Trash2 } from 'lucide-react';
import { ManagedAgent } from '../../types/agent.types';
import { agentManagementService } from '../../services/agentManagement.service';

interface InteractAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: ManagedAgent | null;
  onVoicePreview?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Session {
  id: string;
  startedAt: Date;
  messages: Message[];
}

export const InteractAgentModal: React.FC<InteractAgentModalProps> = ({
  isOpen,
  onClose,
  agent,
  onVoicePreview
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session when modal opens
  useEffect(() => {
    if (isOpen && agent && !session) {
      const newSession: Session = {
        id: Date.now().toString(),
        startedAt: new Date(),
        messages: [{
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm ${agent.name}. ${agent.description || 'How can I help you today?'}`,
          timestamp: new Date()
        }]
      };
      setSession(newSession);
      setMessages(newSession.messages);
    }
  }, [isOpen, agent, session]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!agent) return null;

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Show typing indicator
      setMessages(prev => [...prev, {
        id: 'typing',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true
      }]);

      const response = await agentManagementService.interactWithAgent(agent.id, {
        message: currentMessage,
        sessionId: session?.id,
        history: messages.slice(-10) // Send last 10 messages for context
      });

      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(m => !m.isTyping).concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }));
      setIsLoading(false);
    } catch (error: any) {
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(m => !m.isTyping).concat({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      }));
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      startedAt: new Date(),
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm ${agent.name}. ${agent.description || 'How can I help you today?'}`,
        timestamp: new Date()
      }]
    };
    setSession(newSession);
    setMessages(newSession.messages);
    setShowSessionMenu(false);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Chat history cleared. How can I help you?`,
        timestamp: new Date()
      }]);
      setShowSessionMenu(false);
    }
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
            className="w-full max-w-2xl h-[80vh] bg-gradient-to-br from-surface-primary via-surface-secondary to-neural-light rounded-2xl shadow-2xl border border-neural-accent/20 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-4 border-b border-neural-accent/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-electric-purple p-0.5">
                    <div className="w-full h-full rounded-xl bg-surface-primary flex items-center justify-center text-sm font-bold text-text-primary">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      {agent.name}
                      <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-text-muted">
                      <span>{agent.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agent.voiceConfig.enabled && (
                    <button
                      onClick={onVoicePreview}
                      className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
                      title="Preview Voice"
                    >
                      <Volume2 className="w-5 h-5 text-text-muted" />
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setShowSessionMenu(!showSessionMenu)}
                      className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-text-muted" />
                    </button>
                    {showSessionMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-secondary border border-neural-accent/20 shadow-lg z-20"
                      >
                        <button
                          onClick={handleNewSession}
                          className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-neural-accent/20 transition-colors"
                        >
                          New Session
                        </button>
                        <button
                          onClick={handleClearHistory}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear History
                        </button>
                      </motion.div>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-neural-accent/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-electric-blue/20 text-electric-blue' 
                        : 'bg-electric-purple/20 text-electric-purple'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-electric-blue/20 text-text-primary'
                        : 'bg-neural-light/50 text-text-primary border border-neural-accent/20'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-text-muted rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-text-muted rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-text-muted rounded-full"
                          />
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className="text-xs text-text-muted mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neural-accent/20">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-neural-light/50 border border-neural-accent/20 rounded-lg focus:outline-none focus:border-electric-blue/50 text-text-primary placeholder-text-muted"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-electric-blue to-electric-purple hover:from-electric-purple hover:to-electric-pink text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {session && (
                <p className="text-xs text-text-muted mt-2">
                  Session started {session.startedAt.toLocaleTimeString()}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractAgentModal;