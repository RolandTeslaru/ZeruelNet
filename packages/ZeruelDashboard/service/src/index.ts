import express from "express"
import http from "http"
import { WebSocketServer, WebSocket } from "ws"
import cors from "cors"

const app = express()
app.use(cors({ origin: '*' }))
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.get('/health', (req, res) => {
    res.status(200).send('Dashboard Service is running')
})

