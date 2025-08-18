import dotenvFlow from 'dotenv-flow';
import path from "path"

// Load monorepo env vars
dotenvFlow.config({
    path: path.resolve(__dirname, "../../../../"),
    node_env: process.env.NODE_ENV,
    silent: true
})

// Override with local envs if present
dotenvFlow.config({ silent: true})

import express from 'express';
import cors from 'cors';
import { Logger } from './lib/logger';
import { redisBroker } from './lib/redisBroker';

const app = express();
const PORT = process.env.SCRAPER_SERVICE_PORT;

app.use(cors()); 
app.use(express.json());

// Routes
import v1Routes from './api/v1/routes';
import { eventBus } from './lib/eventBus';
app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.send('Scraper Service is running!');
});


async function startServer() {
    await redisBroker.connect();
    app.listen(PORT, () => {
        Logger.info(`Scraper service listening on http://localhost:${PORT}`);
        // TODO: Whole type sys needs to be migrated to zod
        // eventBus.broadcast("status", { isConnected: true })
    });
}

startServer(); 