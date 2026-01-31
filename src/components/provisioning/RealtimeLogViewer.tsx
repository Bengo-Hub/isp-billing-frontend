'use client';

import { Card } from '@/components/ui/card';
import { config } from '@/lib/config';
import { useEffect, useRef, useState } from 'react';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  stage?: number;
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
  onStageComplete?: (stage: number) => void;  // Callback when a verification stage completes
  onProvisioningComplete?: () => void;
  initialMessage?: string;
  deviceConnected?: boolean;
  pingVerified?: boolean;   // Stage 1 verified
  apiVerified?: boolean;    // Stage 2 verified
  onProgressUpdate?: (percentage: number, operation: string) => void;
}

export function RealtimeLogViewer({
  sessionId,
  title,
  subtitle,
  isConnected: externalIsConnected,
  autoConnect = true,
  showConnectionStatus = true,
  height = 'h-64',
  onDeviceOnline,
  onStageComplete,
  onProvisioningComplete,
  initialMessage = 'Waiting for command execution...',
  deviceConnected = false,
  pingVerified = false,
  apiVerified = false,
  onProgressUpdate
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
      // Use centralized config for WebSocket URL
      const baseWsUrl = config.wsUrl;
      const wsUrl = `${baseWsUrl}/api/v1/provisioning/ws/${sessionId}`;

      console.log(`[RealtimeLogViewer] Connecting WebSocket...`);
      console.log(`[RealtimeLogViewer] - Session ID: ${sessionId}`);
      console.log(`[RealtimeLogViewer] - WebSocket URL: ${wsUrl}`);

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`[RealtimeLogViewer] ✓ WebSocket connected successfully for session ${sessionId}`);
        setWsConnected(true);

        // Capture the current websocket reference for the interval
        const ws = wsRef.current;

        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Ping every 30 seconds

        ws?.addEventListener('close', () => clearInterval(pingInterval));
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
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          message: 'Real-time connection failed. Check that the backend is running.',
          type: 'error'
        });
      };
    } catch (error) {
      console.error('[RealtimeLogViewer] Failed to create WebSocket connection:', error);
      addLog({
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
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

      case 'api_check_result':
        handleApiCheckResult(data);
        break;

      case 'stage_complete':
        handleStageComplete(data);
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

      case 'provisioning_complete':
        handleProvisioningComplete(data);
        break;

      case 'pong':
        // Heartbeat response - no action needed
        break;

      default:
        console.log('[RealtimeLogViewer] Unknown message type:', type);
    }
  };

  const handlePingResult = (data: any) => {
    const { attempt, max_attempts, status, reachable, latency_ms, error, stage, stage_name } = data;

    const stageLabel = stage ? `[Stage ${stage}: ${stage_name || 'Network'}]` : '';

    const newLog: LogEntry = {
      timestamp: data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: reachable
        ? `${stageLabel} ⚡ ICMP Ping (success) - Latency: ${latency_ms?.toFixed(1) || 'N/A'}ms - Attempt ${attempt}/${max_attempts}`
        : `${stageLabel} ⏳ ICMP Ping (waiting) - ${error || 'Device not responding'} - Attempt ${attempt}/${max_attempts}`,
      type: reachable ? 'success' : 'warning',
      stage: stage
    };

    setLogs(prev => [...prev, newLog]);
  };

  const handleApiCheckResult = (data: any) => {
    const { attempt, max_attempts, status, port_open, port, latency_ms, error, stage, stage_name } = data;

    const stageLabel = stage ? `[Stage ${stage}: ${stage_name || 'API'}]` : '';

    const newLog: LogEntry = {
      timestamp: data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: port_open
        ? `${stageLabel} ✓ API Port ${port} (open) - Latency: ${latency_ms?.toFixed(1) || 'N/A'}ms`
        : `${stageLabel} ⏳ API Port ${port} (closed) - ${error || 'Run bootstrap command on router'}`,
      type: port_open ? 'success' : 'warning',
      stage: stage
    };

    setLogs(prev => [...prev, newLog]);
  };

  const handleStageComplete = (data: any) => {
    const { stage, stage_name, message, latency_ms } = data;

    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `✓ Stage ${stage} Complete: ${message}${latency_ms ? ` (${latency_ms.toFixed(1)}ms)` : ''}`,
      type: 'success',
      stage: stage
    };

    setLogs(prev => [...prev, newLog]);

    // Notify parent component
    if (onStageComplete) {
      onStageComplete(stage);
    }
  };

  const handleDeviceOnline = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `✓ ${data.message || 'Device connected and API enabled - ready for configuration'}`,
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
      message: `✗ ${data.message || 'Monitoring error'}`,
      type: 'error'
    };

    setLogs(prev => [...prev, newLog]);
  };

  const handlePingBackoff = (data: any) => {
    const { ping_verified, api_verified } = data;
    let statusHint = '';
    if (ping_verified && !api_verified) {
      statusHint = ' (Device reachable but API not enabled - run bootstrap command)';
    }

    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `⏸ ${data.message || `Backing off - will retry in ${data.backoff_seconds}s`}${statusHint}`,
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

    // Report progress to parent component
    if (onProgressUpdate && data.progress_percentage !== undefined) {
      onProgressUpdate(data.progress_percentage, statusMessage);
    }
  };

  const handleRouterLog = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: data.message || '',
      type: data.level || 'info'
    };

    setLogs(prev => [...prev, newLog]);
  };

  const handleProvisioningComplete = (data: any) => {
    const newLog: LogEntry = {
      timestamp: data.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false }) : new Date().toLocaleTimeString('en-US', { hour12: false }),
      message: `✓ ${data.message || 'Provisioning completed successfully!'}`,
      type: 'success'
    };

    setLogs(prev => [...prev, newLog]);

    // Trigger the callback to redirect to routers page
    if (onProvisioningComplete) {
      // Small delay to let user see the success message
      setTimeout(() => {
        onProvisioningComplete();
      }, 2000);
    }
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

  // Determine overall status for header icon
  const bothVerified = pingVerified && apiVerified;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            {(deviceOnline || bothVerified || deviceConnected) ? (
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

        {/* Show success banner when both stages verified */}
        {bothVerified && (
          <div className="mb-3 p-3 bg-green-900/30 border border-green-700 rounded">
            <div className="flex items-center gap-2 text-green-400">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Device Connected Successfully!</span>
            </div>
            <div className="text-gray-300 text-sm mt-1 ml-7">
              Your device is online and API is enabled - ready for configuration
            </div>
          </div>
        )}

        {logs.length === 0 && !bothVerified && (
          <div className="text-yellow-400 flex items-center gap-2">
            <span className="text-gray-500">$</span>
            <span>{initialMessage}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
