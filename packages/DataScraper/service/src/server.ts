import path from 'path';
import dotenv from 'dotenv';

// load ../../.env (same directory as THIS file)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// or simply put .env beside package.json and do:
dotenv.config();         // looks in current working directory
import express from 'express';
import cors from 'cors';
import { Logger } from './lib/logger';
import { redisBroker } from './lib/redisBroker';
import v1Routes from './api/v1/routes';


const app = express();

const PORT = process.env.PORT ||                        // railway injected env
             process.env.SCRAPER_SERVICE_LOCAL_PORT ||  // used for local development
             3001



app.use(cors()); 
app.use(express.json());

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.send('Scraper Service is running!');
});


async function startServer() {
    await redisBroker.connect();
    app.listen(PORT, () => {
        Logger.info(`Scraper service listening on http://localhost:${PORT}`);
    });
}

startServer(); 