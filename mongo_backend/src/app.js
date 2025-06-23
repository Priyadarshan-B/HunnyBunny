require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const http = require('http');
const morgan = require('morgan');
const connectDB = require('./config/database'); // 👉 MongoDB connection
const routes = require('./routes/routes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB(); // 🔗 Connect DB here

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(routes);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
