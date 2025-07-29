import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/../.env' });

import express from 'express';
import cors from 'cors';
import { initWebSocket } from './api/v1/websocket';
import http from 'http';
import { Logger } from './lib/logger';

const app = express();
const server = http.createServer(app); // Create an HTTP server
const PORT = process.env.HARVESTER_PORT || 4000;

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow the server to understand JSON in request bodies

// Routes
import v1Routes from './api/v1/routes';
app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.send('Harvester Service is running!');
});

// Initialize WebSocket server
initWebSocket(server);

// Start the server
server.listen(PORT, () => {
    Logger.info(`Harvester service listening on http://localhost:${PORT}`);
}); 