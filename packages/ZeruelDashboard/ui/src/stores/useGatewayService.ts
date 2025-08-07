import { create } from "zustand";
import { immer } from "zustand/middleware/immer"

const WS_URL = 'ws://localhost:4000';

export const webSocketEvents = new EventTarget();

type State = {
    socket: null | WebSocket,
    isConnected: boolean
    subscriptionQueue: Array<{ topic: string, callback: (data: any) => void }>
}

type Actions = {
    connect: () => void;
    disconnect: () => void;
    subscribeToTopic: (topic: string, callback: (data: any) => void) => void
}

const SOCKET_ON_MESSAGE_CALLBACK_REGISTRY: Record<string, (data: any) => void> = {}

export const useGatewayService = create<State & Actions>()(
    immer((set, get) => ({
        socket: null,
        isConnected: false,
        subscriptionQueue: [],
        connect: () => {
            if (get().socket) {
                console.warn("Web Scoket already exists.");
                return;
            }

            const ws = new WebSocket(WS_URL);

            ws.onopen = () => {
                set((state) => {
                    state.isConnected = true;
                    state.socket = ws
                });

                // Process any queued subscriptions
                get().subscriptionQueue.forEach(sub => {
                    get().subscribeToTopic(sub.topic, sub.callback);
                });
                
                // Clear the queue
                set(state => { state.subscriptionQueue = [] });

                webSocketEvents.dispatchEvent(new Event("open"));
            };
        
            ws.onclose = () => set((state) => {
                state.isConnected = false
                state.socket = null;

                webSocketEvents.dispatchEvent(new Event("close"));
            });

            ws.onmessage = (event: MessageEvent<any>) => {
                const outerPayload = JSON.parse(event.data);
                const channel = outerPayload.channel;
                
                // The actual message from the service is a stringified JSON object
                const innerPayload = JSON.parse(outerPayload.message);

                // The channel from Redis will be something like 'harvester_logs' or 'harvester_live_feed'.
                // We can use this to route the message to the correct handler.
                const callback = SOCKET_ON_MESSAGE_CALLBACK_REGISTRY[channel];
                if (callback) {
                    callback(innerPayload);
                }
            }
        },
        disconnect: () => {
            get().socket?.close();
        },
        // This is the function that the ui will use to subscribe to the backend
        // topics have the form of "scaper_*" or "trends_*" like scraper_logs
        subscribeToTopic: (topic, callback) => {
            const socket = get().socket;
            if (socket === null || socket.readyState !== WebSocket.OPEN) {
                // Queue subscription if socket isnt ready
                set(state => {
                    state.subscriptionQueue.push({ topic, callback });
                });
                return;
            }
            
            get().socket.send(JSON.stringify({
                action: 'subscribe', topic
            }))
            SOCKET_ON_MESSAGE_CALLBACK_REGISTRY[topic] = callback;
        }
    }))
)
