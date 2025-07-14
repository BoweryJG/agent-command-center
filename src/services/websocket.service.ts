import { io, Socket } from 'socket.io-client';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface WebSocketOptions {
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

  constructor() {
    // Auto-connect on service instantiation
    this.connect();
  }

  // Connect to WebSocket server
  connect(options: WebSocketOptions = {}): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.socket = io(this.WS_URL, {
        reconnection: options.reconnection ?? true,
        reconnectionAttempts: options.reconnectionAttempts ?? 5,
        reconnectionDelay: options.reconnectionDelay ?? 1000,
        timeout: options.timeout ?? 10000,
        transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.fallbackToREST();
    }
  }

  // Set up socket event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.emit('connection', { status: 'connected' });
      
      // Clear any pending reconnect timers
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection', { status: 'disconnected', reason });
      
      // Attempt manual reconnection if needed
      if (reason === 'io server disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    // Handle custom events
    this.socket.on('agent-update', (data) => {
      this.emit('agent-update', data);
    });

    this.socket.on('deployment-status', (data) => {
      this.emit('deployment-status', data);
    });

    this.socket.on('voice-generation-progress', (data) => {
      this.emit('voice-generation-progress', data);
    });

    this.socket.on('interaction-response', (data) => {
      this.emit('interaction-response', data);
    });

    this.socket.on('analytics-update', (data) => {
      this.emit('analytics-update', data);
    });
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, 5000);
  }

  // Fallback to REST API when WebSocket is unavailable
  private fallbackToREST(): void {
    console.log('WebSocket unavailable, falling back to REST API');
    this.isConnected = false;
    this.emit('connection', { status: 'fallback', mode: 'REST' });
  }

  // Send message through WebSocket
  send(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      // Add timeout for response
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket request timeout'));
      }, 30000);

      // Send with acknowledgment
      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Subscribe to events
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  // Emit event to all listeners
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for event ${event}:`, error);
        }
      });
    }
  }

  // Check connection status
  isWebSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.listeners.clear();
  }

  // Join a room (for agent-specific updates)
  joinRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', room);
    }
  }

  // Leave a room
  leaveRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', room);
    }
  }

  // Real-time agent interaction
  async startInteractionSession(agentId: string): Promise<string> {
    try {
      const response = await this.send('start-interaction', { agentId });
      return response.sessionId;
    } catch (error) {
      console.error('Failed to start interaction session:', error);
      throw error;
    }
  }

  // Send message in interaction session
  async sendInteractionMessage(sessionId: string, message: string): Promise<void> {
    try {
      await this.send('interaction-message', { sessionId, message });
    } catch (error) {
      console.error('Failed to send interaction message:', error);
      throw error;
    }
  }

  // End interaction session
  async endInteractionSession(sessionId: string): Promise<void> {
    try {
      await this.send('end-interaction', { sessionId });
    } catch (error) {
      console.error('Failed to end interaction session:', error);
      // Don't throw, just log - session cleanup is not critical
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export types
export type { WebSocketService };