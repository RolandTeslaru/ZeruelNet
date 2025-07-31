import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/../.env' });

import express from 'express';
import cors from 'cors';
import { Logger } from './lib/logger';
import { messageBroker } from './lib/messageBroker';

const app = express();
const PORT = process.env.HARVESTER_PORT || 3001;

app.use(cors()); 
app.use(express.json());

// Routes
import v1Routes from './api/v1/routes';
app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.send('Scraper Service is running!');
});


async function startServer() {
    await messageBroker.connect();
    app.listen(PORT, () => {
        Logger.info(`Scraoer service listening on http://localhost:${PORT}`);
    });
}

startServer(); 