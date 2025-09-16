import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
import express from 'express';
import cors from 'cors';
import { Logger } from './lib/logger';
import { redisBroker } from './lib/redisBroker';
import v1Routes from './api/v1/routes';
import { Server } from 'http';


const app = express();

const PORT = process.env.PORT ||
    process.env.SCRAPER_SERVICE_LOCAL_PORT ||
    3001

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;
const isLocal = !isRailway



app.use(cors());
app.use(express.json());

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.send('Scraper Service is running!');
});


async function startServer() {
    await redisBroker.connect();

    const server = app.listen(PORT, () => {
        Logger.info(`Scraper service listening on http://localhost:${PORT}`);

        if (isRailway) {
            Logger.info(`Running on Railway (${process.env.RAILWAY_ENVIRONMENT})`);
            Logger.info(`Project: ${process.env.RAILWAY_PROJECT_ID}`);
        } else if (isLocal) {
            Logger.info('Running in local development mode');
        }
    });

    if (isRailway)
        handleOnRailway(server);
}

startServer();


// Railway can shutdown the service fi there no https activity for a while
const handleOnRailway = (server: Server) => {
    const gracefulShutdown = (signal: string) => {
        Logger.info(`Received ${signal} on Railway, shutting down gracefully...`);
        server.close(() => {
            Logger.info('HTTP server closed');
            redisBroker.disconnect();
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}