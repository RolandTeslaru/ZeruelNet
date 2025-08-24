import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';
import cors from 'cors';
import { isOriginAllowed } from './originGuard';

const app = express();
app.use(cors({ origin: '*' })); // Allow all origins for simplicity
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// All websockets that are subscribed to the GatewayService ( scraper_, dashboard_, enrichment_ ....)
const subscriptions = new Map<WebSocket, Set<string>>();

const redisSubscriber = createClient({
    url: process.env.REDIS_URL,
    socket: {
        family: 0  // Enable dual-stack DNS lookup for Railway's IPv6 network
    }
});

const PORT = process.env.PORT ||
             process.env.LOCAL_GATEWAY_PORT ||
             4001

app.get('/health', (req, res) => {
    res.status(200).send('Gateway service is running');
});

wss.on('connection', (ws, req) => {
    const origin = req.headers.origin as string | undefined
    if (!isOriginAllowed(origin)){
        ws.close(4003, "forbidden origin")
        return;
    }

    console.log('Origin connected');
    subscriptions.set(ws, new Set());

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            const subs = subscriptions.get(ws);
            if (!subs) return;

            if (data.action === 'subscribe' && data.topic) {
                console.log(`Client subscribed to ${data.topic}`);
                subs.add(data.topic);
            } else if (data.action === 'unsubscribe' && data.topic) {
                console.log(`Client unsubscribed from ${data.topic}`);
                subs.delete(data.topic);
            }
        } catch (error) {
            console.error('Failed to parse message from client', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        subscriptions.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});


async function startServer() {
    redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
    await redisSubscriber.connect();
    console.log('Connected to Redis and ready to subscribe.');

    // Subscribe to the channels
    await redisSubscriber.pSubscribe('scraper_*', pubSubListenerCallback);
    await redisSubscriber.pSubscribe('dashboard_*', pubSubListenerCallback)
    await redisSubscriber.pSubscribe('enrichment_*', pubSubListenerCallback)

    server.listen(PORT, () => {
        console.log(`Gateway Service listening on http://localhost:${PORT}`);
    });
}

startServer(); 


const pubSubListenerCallback = (message: string, channel: string) => {
    wss.clients.forEach(client => {
        const subs = subscriptions.get(client)
        if (subs && subs.has(channel) && client.readyState === client.OPEN){
            client.send(JSON.stringify({ channel, message}))
        }
    })
}