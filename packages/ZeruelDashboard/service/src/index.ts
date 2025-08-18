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

import express from "express"
import cors from "cors"
import v1Routes from "./api/v1/routes"
import { messageBroker } from './lib/messageBroker';
import { Logger } from './lib/logger';
import { getDatabaseHealth } from './api/v1/controllers/health';

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/health', (_req, res) => res.status(200).send("ZeruelDashboard Service is running"))
app.get('/health/database', getDatabaseHealth)
app.use("/api/v1", v1Routes)

const PORT = process.env.ZERUEL_DASHBOARD_SERVICE_PORT

async function startServer() {
    await messageBroker.connect()
    app.listen(PORT, () => {
        Logger.info(`Dashboard Service listening on http://localhost:${PORT}`)
    })
}

startServer()