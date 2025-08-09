import express from "express"
import http from "http"
import { WebSocketServer, WebSocket } from "ws"
import cors from "cors"
import v1Routes from "./api/v1/routes"

const app = express()
app.use(cors({ origin: '*' }))
app.use(express.json())

app.get('/health', (_req, res) => res.status(200).send("TrendAnalysis Service is running"))
app.use("/api/v1", v1Routes)

const PORT = process.env.PORT || 5003
app.listen(PORT, () => {
    console.log(`Trend Analysis Service: listening on localhost:${PORT}`)
})