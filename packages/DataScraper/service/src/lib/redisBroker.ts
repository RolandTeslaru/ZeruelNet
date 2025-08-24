import { createClient } from 'redis';
import { Logger } from './logger';

const publisher = createClient({
    url: process.env.REDIS_URL
});

publisher.on('error', (err) => Logger.error('Redis Publisher Error', err));

async function connect() {
    if (!publisher.isOpen) {
        await publisher.connect();
        Logger.info('Connected to Redis publisher.');
    }
}

async function disconnect() {
    if (publisher.isOpen) {
        await publisher.quit();
        Logger.info('Disconnected from Redis publisher.');
    }
}

async function publish(channel: string, message: string) {
    if (!publisher.isOpen) {
        await connect();
    }
    await publisher.publish(channel, message);
}

export const redisBroker = {
    connect,
    disconnect,
    publish,
}; 