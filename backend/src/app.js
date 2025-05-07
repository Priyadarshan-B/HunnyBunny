require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const WebSocket = require('ws');
const path = require("path");
const http = require('http');
const morgan = require('morgan');
const routes = require('./routes/routes');

const app = express();
const server = http.createServer(app);

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// WebSocket Server using server
// const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// routes
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(routes)



// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket setup

// wss.on('connection', (ws) => {
//     console.log('New WebSocket client connected');

//     ws.on('message', (message) => {
//         const textmessage = message.toString();
//       console.log('Received message:', message);

//       wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(textmessage); 
//         }
//       });
//     });

//     ws.on('close', () => {
//       console.log('WebSocket client disconnected');
//     });
// });