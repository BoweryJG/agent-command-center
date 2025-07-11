import { EventEmitter } from 'events';

// WebSocket event types
export enum WebSocketEventType {
  METRIC_UPDATE = 'metric_update',
  AGENT_STATUS_CHANGE = 'agent_status_change',
  VOICE_CLONE_PROGRESS = 'voice_clone_progress',
  TRAINING_MILESTONE = 'training_milestone',
  CLIP_PLAYED = 'clip_played',
  CONNECTION_ESTABLISHED = 'connection_established',
  ROOM_JOINED = 'room_joined',
  ROOM_LEFT = 'room_left',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  RECONNECTED = 'reconnected'
}

// Room types
export enum WebSocketRoomType {
  DASHBOARD_OVERVIEW = 'dashboard:overview',
  AGENT = 'agent:', // agent:{id}
  VOICE_TRAINING = 'voice:training',
  CLIPS_ANALYTICS = 'clips:analytics',
  USER = 'user:', // user:{id}
  ADMIN = 'admin:broadcast'
}

interface WebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private heartbeatInterval: number;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private clientId: string | null = null;
  private reconnectToken: string | null = null;
  private isAuthenticated: boolean = false;
  private joinedRooms: Set<string> = new Set();

  constructor(options: WebSocketOptions = {}) {
    super();
    
    // Configuration
    this.url = options.url || this.getWebSocketUrl();
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
  }

  /**
   * Get WebSocket URL based on environment
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_URL || 
                 process.env.REACT_APP_API_URL?.replace(/^https?:/, '') || 
                 window.location.host;
    
    return `${protocol}//${host}/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // Add authentication token to URL if provided
      let connectUrl = this.url;
      if (token) {
        connectUrl += `?token=${encodeURIComponent(token)}`;
      }

      // Add reconnect token if available
      if (this.reconnectToken) {
        const separator = connectUrl.includes('?') ? '&' : '?';
        connectUrl += `${separator}reconnectToken=${encodeURIComponent(this.reconnectToken)}`;
      }

      this.ws = new WebSocket(connectUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.stopHeartbeat();
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      if (event.code !== 1000) { // Abnormal closure
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: any): void {
    const { type, data: payload, error } = data;

    switch (type) {
      case WebSocketEventType.CONNECTION_ESTABLISHED:
        this.clientId = payload.clientId;
        this.reconnectToken = payload.reconnectToken;
        this.emit('connectionEstablished', payload);
        break;

      case WebSocketEventType.RECONNECTED:
        this.joinedRooms = new Set(payload.rooms);
        this.emit('reconnected', payload);
        break;

      case WebSocketEventType.ROOM_JOINED:
        this.joinedRooms.add(payload.room);
        this.emit('roomJoined', payload);
        break;

      case WebSocketEventType.ROOM_LEFT:
        this.joinedRooms.delete(payload.room);
        this.emit('roomLeft', payload);
        break;

      case WebSocketEventType.ERROR:
        console.error('WebSocket error message:', error);
        this.emit('error', error);
        break;

      case 'auth:success':
        this.isAuthenticated = true;
        this.emit('authenticated', payload);
        break;

      default:
        // Emit custom events
        this.emit(type, payload);
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(type: string, payload?: any): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: WebSocketMessage = { type, payload };
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Authenticate with the WebSocket server
   */
  authenticate(token: string): void {
    this.send('auth', { token });
  }

  /**
   * Join a room/channel
   */
  joinRoom(room: string): void {
    this.send('join', { room });
  }

  /**
   * Leave a room/channel
   */
  leaveRoom(room: string): void {
    this.send('leave', { room });
  }

  /**
   * Send message to a room
   */
  sendToRoom(room: string, data: any): void {
    this.send('message', { room, data });
  }

  /**
   * Subscribe to metrics
   */
  subscribeToMetrics(metrics: string[]): void {
    this.send('metrics:subscribe', { metrics });
  }

  /**
   * Get metrics data
   */
  getMetrics(filters?: any): void {
    this.send('metrics:get', filters || {});
  }

  /**
   * Get dashboard summary
   */
  getDashboardSummary(): void {
    this.send('metrics:dashboard', {});
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.clientId = null;
    this.reconnectToken = null;
    this.isAuthenticated = false;
    this.joinedRooms.clear();
  }

  /**
   * Get connection state
   */
  getState(): {
    connected: boolean;
    authenticated: boolean;
    clientId: string | null;
    joinedRooms: string[];
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      authenticated: this.isAuthenticated,
      clientId: this.clientId,
      joinedRooms: Array.from(this.joinedRooms)
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Export service and types
export default websocketService;
export { WebSocketService };

// React hooks
import { useEffect, useState } from 'react';

/**
 * React hook for WebSocket connection
 */
export function useWebSocket(token?: string) {
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const handleConnected = () => setConnected(true);
    const handleDisconnected = () => setConnected(false);
    const handleAuthenticated = () => setAuthenticated(true);

    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('authenticated', handleAuthenticated);

    // Connect if not already connected
    if (!connected) {
      websocketService.connect(token);
    } else if (token && !authenticated) {
      websocketService.authenticate(token);
    }

    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('authenticated', handleAuthenticated);
    };
  }, [token, connected, authenticated]);

  return {
    connected,
    authenticated,
    service: websocketService
  };
}

/**
 * React hook for WebSocket room subscription
 */
export function useWebSocketRoom(room: string, onMessage?: (data: any) => void) {
  const { service, connected } = useWebSocket();

  useEffect(() => {
    if (!connected || !room) return;

    // Join room
    service.joinRoom(room);

    // Handle room messages
    const handleRoomMessage = (data: any) => {
      if (data.room === room && onMessage) {
        onMessage(data);
      }
    };

    service.on('room:message', handleRoomMessage);

    return () => {
      service.leaveRoom(room);
      service.off('room:message', handleRoomMessage);
    };
  }, [service, connected, room, onMessage]);
}

/**
 * React hook for WebSocket metrics
 */
export function useWebSocketMetrics(metricTypes?: string[]) {
  const { service, connected } = useWebSocket();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!connected) return;

    // Subscribe to metrics if types provided
    if (metricTypes && metricTypes.length > 0) {
      service.subscribeToMetrics(metricTypes);
    }

    // Handle metric updates
    const handleMetricUpdate = (data: any) => {
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        [data.metricType]: data.metrics
      }));
    };

    const handleMetricsData = (data: any) => {
      setMetrics(data);
    };

    service.on(WebSocketEventType.METRIC_UPDATE, handleMetricUpdate);
    service.on('metrics:data', handleMetricsData);

    // Get initial metrics
    service.getMetrics();

    return () => {
      service.off(WebSocketEventType.METRIC_UPDATE, handleMetricUpdate);
      service.off('metrics:data', handleMetricsData);
    };
  }, [service, connected, metricTypes]);

  return metrics;
}