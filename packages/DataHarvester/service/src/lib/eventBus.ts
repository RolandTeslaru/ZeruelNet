import { EventEmitter } from 'events';

class EventBus extends EventEmitter {}
 
// Create a single, shared instance of the EventBus
export const eventBus = new EventBus(); 