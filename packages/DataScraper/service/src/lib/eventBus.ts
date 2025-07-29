import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
    
    private static instance: EventBus
    
    public static getInstance(): EventBus {
        if(!EventBus.instance)
            EventBus.instance = new EventBus();
        return EventBus.instance
    }

    private constructor() { super() }
    
    public broadcast(topic, payload){
        this.emit("publish", {
            topic,
            payload
        })
    }
}

export const eventBus = EventBus.getInstance();