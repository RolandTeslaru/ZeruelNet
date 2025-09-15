import { createClient } from 'redis';

const publisher = createClient({
    url: process.env.REDIS_URL,
    socket: {
        family: 0  // Enable dual-stack DNS lookup for Railway IPv6 network
    }
});

publisher.on('error', (err) => console.error('Redis Publisher Error', err));

async function connect() {
    if (!publisher.isOpen) {
        await publisher.connect();
        console.log('Connected to Redis publisher.');
    }
}

async function disconnect() {
    if (publisher.isOpen) {
        await publisher.quit();
        console.log('Disconnected from Redis publisher.');
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
