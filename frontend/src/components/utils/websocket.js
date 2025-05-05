import React, { useEffect } from 'react';

function ScannerListener({ onScan }) {
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:5000'; 
    const socket = new WebSocket(serverUrl);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('Received barcode data:', event.data);
      onScan(event.data);
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, [onScan]);

  return null;
}

export default ScannerListener;
