'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface RealtimeLogViewerProps {
  sessionId: string | null;
  title: string;
  subtitle?: string;
  isConnected?: boolean;
  autoConnect?: boolean;
  showConnectionStatus?: boolean;
  height?: string;
  onDeviceOnline?: () => void;
}

export function RealtimeLogViewer({
  sessionId,
  title,
  subtitle,
  isConnected: externalIsConnected,
  autoConnect = true,
  showConnectionStatus = true,
  height = 'h-64',
  onDeviceOnline
}: RealtimeLogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [deviceOnline, setDeviceOnline] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine connection status (external prop takes precedence)
  const isConnected = externalIsConnected !== undefined ? externalIsConnected : wsConnected;

  useEffect(() => {
    if (!sessionId || !autoConnect) {
      cleanup();
      return;
    }

    connectWebSocket();

    return () => {
      cleanup();
    };
  }, [sessionId, autoConnect]);

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setWsConnected(false);
  };

  const connectWebSocket = () => {
    if (!sessionId) {
      console.log('[RealtimeLogViewer] No sessionId provided, skipping WebSocket connection');
      return;
    }

    try {
      // Log environment variables for debugging
      console.log('[RealtimeLogViewer] Environment check:');
      console.log('  - NEXT_PUBLIC_WS_URL:', process.env.NEXT_PUBLIC_WS_URL);
      console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      
      // Construct WebSocket URL using dedicated WS URL or fallback
      let wsUrl: string;
      
      if (process.env.NEXT_PUBLIC_WS_URL) {
        // Use dedicated WebSocket URL from env
        wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/api/v1/provisioning/ws/${sessionId}`;
        console.log('[RealtimeLogViewer] Using NEXT_PUBLIC_WS_URL');
      } else {
        // Fallback: construct from API base URL or current location
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        
        if (apiBaseUrl) {
          // Extract host from API base URL (e.g., "http://127.0.0.1:8000/api/v1" -> "127.0.0.1:8000")
          const apiHost = apiBaseUrl.replace(/^https?:\/\//, '').split('/')[0];
          wsUrl = `${wsProtocol}//${apiHost}/api/v1/provisioning/ws/${sessionId}`;
          console.log('[RealtimeLogViewer] Using NEXT_PUBLIC_API_BASE_URL, extracted host:', apiHost);
        } else {
          // Last resort: use current window location
          wsUrl = `${wsProtocol}//${window.location.host}/api/v1/provisioning/ws/${sessionId}`;
          console.log('[RealtimeLogViewer] WARNING: Using window.location.host (fallback):', window.location.host);
        }
      }
      
      console.log(`[RealtimeLogViewer] Attempting WebSocket connection...`);
      console.log(`[RealtimeLogViewer] - Session ID: ${sessionId}`);
      console.log(`[RealtimeLogViewer] - WebSocket URL: ${wsUrl}`);
      console.log(`[RealtimeLogViewer] - NEXT_PUBLIC_WS_URL: ${process.env.NEXT_PUBLIC_WS_URL || 'not set'}`);
      console.log(`[RealtimeLogViewer] - NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'not set'}`);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`[RealtimeLogViewer] ✓ WebSocket connected successfully for session ${sessionId}`);
        setWsConnected(true);
        
        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Ping every 30 seconds
        
        wsRef.current.addEventListener('close', () => clearInterval(pingInterval));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('[RealtimeLogViewer] Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`[RealtimeLogViewer] WebSocket disconnected for session ${sessionId}`);
        console.log(`[RealtimeLogViewer] - Close code: ${event.code}, reason: ${event.reason || 'none'}`);
        setWsConnected(false);
        
        // Attempt to reconnect after 3 seconds if session is still active
        if (sessionId && autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[RealtimeLogViewer] Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[RealtimeLogViewer] ✗ WebSocket error occurred');
        console.error('[RealtimeLogViewer] - Error details:', error);
        console.error('[RealtimeLogViewer] - WebSocket URL attempted:', wsUrl);
        console.error('[RealtimeLogViewer] - WebSocket readyState:', wsRef.current?.readyState);
        setWsConnected(false);
        
        // Add log entry for user visibility
        addLog({
          timestamp: new Date().toISOString(),
          message: 'Real-time connection failed. Check that the backend is running.',
          type: 'error'
        });
      };
    } catch (error) {
      console.error('[RealtimeLogViewer] Failed to create WebSocket connection:', error);
      addLog({
        timestamp: new Date().toISOString(),
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    }
  };

  // Helper to add a log entry
  const addLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const handleWebSocketMessage = (message: any) => {
    const { type, data } = message;

    switch (type) {
      case 'ping_result':
        handlePingResult(data);
        break;
      
      case 'device_online':
        handleDeviceOnline(data);
        break;
      
      case 'ping_timeout':
        handlePingTimeout(data);
        break;
      
      case 'ping_backoff':
        handlePingBackoff(data);
        break;
      
      case 'ping_retry':
        handlePingRetry(data);
        break;
      
      case 'ping_error':
        handlePingError(data);
        break;
      
      case 'log':
        handleLogEntry(data);
        break;
      
      case 'status':
        handleStatusUpdate(data);
        break;
      
      case 'router_log':
        handleRouterLog(data);
        break;
      
      case 'pong':
        // Heartbeat response - no action needed
        break;
      
      default:
        console.log('[RealtimeLogViewer] Unknown message type:', type);
    }
  };

  const handlePingResult = (data: any) => {
    const { attempt, max_attempts, status, reachable, latency_ms, error } = data;
    
    const newLog: LogEntry = {
      timestamp: data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: reachable
        ? `⚡ ICMP Ping (success) - Latency: ${latency_ms?.toFixed(1) || 'N/A'}ms - Attempt ${attempt}/${max_attempts}`
        : `⚠ ICMP Ping (failed) - ${error || 'Device not responding'} - Attempt ${attempt}/${max_attempts}`,
      type: reachable ? 'success' : 'warning'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handleDeviceOnline = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `✓ ${data.message || 'Device is now online and reachable'}${data.latency_ms ? ` (${data.latency_ms.toFixed(1)}ms)` : ''}`,
      type: 'success'
    };
    
    setLogs(prev => [...prev, newLog]);
    setDeviceOnline(true);
    
    if (onDeviceOnline) {
      onDeviceOnline();
    }
  };

  const handlePingTimeout = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `✗ ${data.message || 'Device connection timeout'}`,
      type: 'error'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handlePingError = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `✗ ${data.message || 'Ping monitoring error'}`,
      type: 'error'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handlePingBackoff = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `⏸ ${data.message || `Backing off - will retry in ${data.backoff_seconds}s`}`,
      type: 'warning'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handlePingRetry = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `🔄 ${data.message || `Resuming device detection (retry cycle ${data.retry_cycle})...`}`,
      type: 'info'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handleLogEntry = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: data.message || data.log || '',
      type: data.level || data.type || 'info'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handleStatusUpdate = (data: any) => {
    const statusMessage = data.current_operation || data.message || 'Status updated';
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `» ${statusMessage}${data.progress_percentage ? ` (${Math.round(data.progress_percentage)}%)` : ''}`,
      type: 'info'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  const handleRouterLog = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: data.message || '',
      type: data.level || 'info'
    };
    
    setLogs(prev => [...prev, newLog]);
  };

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            {deviceOnline ? (
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4 w-4 animate-pulse text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" />
              </svg>
            )}
            {title}
          </h3>
          
          {showConnectionStatus && (
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-xs px-2 py-1 rounded font-semibold ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>

      <div 
        ref={logContainerRef}
        className={`bg-black p-4 font-mono text-xs ${height} overflow-y-auto`}
      >
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className={getLogColor(log.type)}>
              {log.message}
            </span>
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="text-gray-500 flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting to live stream...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
