'use client';

import { useEffect, useRef, useState } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface LiveProvisioningLogProps {
  sessionId: string | null;
  isActive: boolean;
}

export function LiveProvisioningLog({ sessionId, isActive }: LiveProvisioningLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId || !isActive) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Connect to WebSocket for live logs
    const connectWebSocket = () => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_BASE_URL}/provisioning/ws/${sessionId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected for provisioning logs');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'log') {
            const newLog: LogEntry = {
              timestamp: data.data.timestamp || new Date().toLocaleTimeString(),
              message: data.data.message || data.data.log || '',
              type: data.data.level || 'info'
            };
            
            setLogs(prev => [...prev, newLog]);
          } else if (data.type === 'status') {
            // Handle status updates
            console.log('Status update:', data.data);
          } else if (data.type === 'router_log') {
            // Handle router logs
            const newLog: LogEntry = {
              timestamp: data.data.timestamp || new Date().toLocaleTimeString(),
              message: data.data.message || '',
              type: 'info'
            };
            setLogs(prev => [...prev, newLog]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (sessionId && isActive) {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId, isActive]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Add mock logs for demonstration
  useEffect(() => {
    if (isActive && logs.length === 0) {
      const mockLogs: LogEntry[] = [
        { timestamp: '11:52:23', message: 'Queued configuration job...', type: 'info' },
        { timestamp: '11:52:23', message: 'Starting device configuration...', type: 'info' },
        { timestamp: '11:52:23', message: 'Connecting to device API...', type: 'info' },
        { timestamp: '11:52:24', message: 'Setting system identity...', type: 'info' },
        { timestamp: '11:52:24', message: 'Ensuring bridge codevertex-bridge exists...', type: 'info' },
        { timestamp: '11:52:25', message: 'Adding port ether2 to bridge...', type: 'info' },
        { timestamp: '11:52:25', message: 'Adding port ether3 to bridge...', type: 'info' },
        { timestamp: '11:52:26', message: 'Configuring hotspot service...', type: 'info' },
        { timestamp: '11:52:27', message: 'Configuring PPPoE service...', type: 'info' },
        { timestamp: '11:52:28', message: 'Applying anti-sharing rules...', type: 'info' },
        { timestamp: '11:52:29', message: 'Configuration completed successfully!', type: 'success' }
      ];
      setLogs(mockLogs);
    }
  }, [isActive, logs.length]);

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Live Configuration</span>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      <div 
        ref={logContainerRef}
        className="bg-black text-green-400 p-4 rounded-md overflow-auto text-xs font-mono h-48 border border-gray-700"
      >
        {logs.map((log, index) => (
          <div key={index} className={`${getLogColor(log.type)}`}>
            [{log.timestamp}] {log.message}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500">Waiting for provisioning logs...</div>
        )}
      </div>
    </div>
  );
}
