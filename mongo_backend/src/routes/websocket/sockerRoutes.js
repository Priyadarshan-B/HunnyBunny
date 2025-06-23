const { handleSocketConnection } = require('../controllers/websocket/scanSocket');
const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    handleSocketConnection(ws, wss);
  });

  console.log('WebSocket server is ready.');
}

module.exports = { setupWebSocket };
