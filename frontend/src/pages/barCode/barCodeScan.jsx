import React, { useEffect } from 'react';

export const QRCodeScanner = ({ onScan }) => {
  useEffect(() => {
    // Setup WebSocket connection
    const socket = new WebSocket('ws://192.168.226.57:5000'); 

    socket.onopen = () => {
      console.log('WebSocket connected for scanner');
    };

    socket.onmessage = (event) => {
      const scannedData = event.data;
      if (scannedData) {
        onScan(scannedData);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, [onScan]);

  return (
    <div className="mb-6 text-lg font-semibold">
      Listening for scanned QR / Barcode...
    </div>
  );
};
