import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { eventBus } from '../../lib/eventBus';
import { Logger } from '../../lib/logger';

let wss: WebSocketServer;

// In-memory store for topic subscriptions
// Map<topicName, Set<WebSocketClient>>
const topics = new Map<string, Set<WebSocket>>();

const handleSubscription = (ws: WebSocket, topic: string) => {
    if (!topics.has(topic)) {
        topics.set(topic, new Set());
    }
    topics.get(topic)!.add(ws);
    
    Logger.debug(`Client subscribed to topic: ${topic}`);
};

const handleUnsubscription = (ws: WebSocket, topic: string) => {
    if (topics.has(topic)) {
        topics.get(topic)!.delete(ws);
        Logger.debug(`Client unsubscribed from topic: ${topic}`);
    }
};

const handleIncomingMessage = (ws: WebSocket, message: string) => {
    try {
        const data = JSON.parse(message);
        if (data.action === 'subscribe' && data.topic) {
            handleSubscription(ws, data.topic);
        } else if (data.action === 'unsubscribe' && data.topic) {
            handleUnsubscription(ws, data.topic);
        }
    } catch (e) {
        Logger.warn('Received invalid WebSocket message:', message);
    }
};

const handleClientDisconnect = (ws: WebSocket) => {
    Logger.debug('Client disconnected. Cleaning up subscriptions.');
    // On disconnect, remove the client from all topics
    topics.forEach((clients, topic) => {
        if (clients.has(ws)) {
            clients.delete(ws);
        }
    });
};

const publishToTopic = ({ topic, payload }: { topic: string, payload: any }) => {
    if (!wss) return;

    const subscribers = topics.get(topic);
    if (subscribers) {
        const data = JSON.stringify({
            topic,
            ...payload
        });
        subscribers.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
};


export const initWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        Logger.info('Client connected to WebSocket');

        ws.on('message', (message: string) => handleIncomingMessage(ws, message));
        ws.on('close', () => handleClientDisconnect(ws));
        ws.on('error', (error) => Logger.error('WebSocket error:', error));
    });

    // Listen to the central event bus for 'publish' events
    eventBus.on('publish', publishToTopic);

    Logger.info('WebSocket Pub/Sub server initialized');
}; 