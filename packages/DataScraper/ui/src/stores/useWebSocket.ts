import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useSystemStatus } from "./useSystemStatus";

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

export const useWebSocket = create<State & Actions>()(
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
                const data = JSON.parse(event.data);
                const topic = data.topic;

                const callback = SOCKET_ON_MESSAGE_CALLBACK_REGISTRY[topic];
                if (callback)
                    callback(data);
            }
        },
        disconnect: () => {
            get().socket?.close();
        },
        subscribeToTopic: (topic, callback) => {
            if(get().socket === null){
                // Queue subscription if socket isnt ready, which is likely
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
