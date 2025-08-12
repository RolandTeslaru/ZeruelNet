import EventEmitter from 'events';
import { messageBroker } from './messageBroker';

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.on('publish', this.handlePublish);
    }

    // A topic is for example "logs", "job_feed"
    // A channel is for example: "scraper_logs", "scraper_job_feed"

    public broadcast(topic: string, payload: any){
        const channel = `dashboard_${topic}`;

        this.emit("publish", { channel, payload });
    }

    private async handlePublish({channel, payload }: {channel: string, payload: any}) {
        const message = JSON.stringify(payload);
        
        try {
            await messageBroker.publish(channel, message);
        } catch (error) {
            // If this fails, we should probably log it, but we don't want to crash the app.
            // The Logger uses the event bus, so we can't use it here to avoid a circular dependency.
            console.error(`[EventBus] Failed to publish message to Redis channel ${channel}`, error);
        }
    }
}

export const eventBus = new EventBus();