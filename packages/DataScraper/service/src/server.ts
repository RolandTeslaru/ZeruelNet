import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/../.env' });

import express from 'express';
import cors from 'cors';
import { Logger } from './lib/logger';
import { messageBroker } from './lib/messageBroker';

const app = express();
const PORT = process.env.HARVESTER_PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json()); // Allow the server to understand JSON in request bodies

// Routes
import v1Routes from './api/v1/routes';
app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.send('Scraper Service is running!');
});


// Start the server
async function startServer() {
    await messageBroker.connect();
    app.listen(PORT, () => {
        Logger.info(`Scraoer service listening on http://localhost:${PORT}`);
    });
}

startServer(); 