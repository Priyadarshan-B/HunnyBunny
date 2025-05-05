function handleSocketConnection(ws, wss) {
    console.log('🔌 New WebSocket client connected');
  
    ws.on('message', (message) => {
      console.log('Received message:', message);
  
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(message);
        }
      });
    });
  
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  }
  
  module.exports = { handleSocketConnection };
  