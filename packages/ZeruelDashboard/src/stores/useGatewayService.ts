import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useSystem } from "./useSystem";

export const webSocketEvents = new EventTarget();

type State = {
    socket:                 null | WebSocket,
    isConnected:            boolean
    subscriptionRegistry:   Record<string, { topic: string, callback: (data: any) => void }>
    subscriptionQueue:      Array<{ topic: string, callback: (data: any) => void }>
}

type Actions = {
    connect:            () => void;
    disconnect:         () => void;
    subscribeToTopic:   (topic: string, callback: (data: any) => void) => void
}

const SOCKET_ON_MESSAGE_CALLBACK_REGISTRY: Record<string, (data: any) => void> = {}

export const useGatewayService = create<State & Actions>()(
    immer((set, get) => ({
        socket: null,
        isConnected: false,
        subscriptionRegistry: {},
        subscriptionQueue: [],
        connect: async () => {
            console.log("Establishing connection to GatewayService")
            if (get().socket) {
                console.warn("Web Socket already exists.");
                return;
            }

            const gatewayWebsocketUrl = process.env.NEXT_PUBLIC_GATEWAY_WEBSOCKET_URL
            if(!gatewayWebsocketUrl)
                console.error("Public GatewayService Websocket Url has not been provided in the env")

            console.log("CONNECTING TO GATEWAY WEBSOCKET AT:", gatewayWebsocketUrl)

            
            const ws = new WebSocket(process.env.NEXT_PUBLIC_GATEWAY_WEBSOCKET_URL);

            ws.onopen = () => {
                useSystem.getState().setOverrideStage({
                    variant: "SUCCESS",
                    title: "GATEWAY  WS  CONNECTION  ESTABLISHED"
                }, 3000)
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

                console.log("useGatewayService: WebSocket connection established")
            };
        
            ws.onclose = (event) => set((state) => {
                state.isConnected = false
                state.socket = null;

                // Re-queue all existing subscriptions
                set(state => {
                    state.subscriptionQueue = Object.values(state.subscriptionRegistry);
                })

                webSocketEvents.dispatchEvent(new Event("close"));
                
                if(event.code){
                    console.log("WebSocket Connection Lost. Reconnecting in 3s...")
                    
                    useSystem.getState().setOverrideStage({
                        variant: "STANDBY",
                        title: `STANDBY  ${event.code}:  RECONNECTING  TO  WS  GATEWAY  IN  3S`
                    }, 3000).then(() => {
                        get().connect()
                    })
                        
                }
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

            ws.onerror = e => {
                
            }
        },
        disconnect: () => {
            get().socket?.close();
        },
        // This is the function that the ui will use to subscribe to the backend
        // topics have the form of "scaper_*" or "trends_*" like scraper_logs
        subscribeToTopic: (topic, callback) => {
            const socket = get().socket;

            set(state => {
                state.subscriptionRegistry[topic] = { topic, callback };
            })

            if (socket === null || socket.readyState !== WebSocket.OPEN) {
                // console.error("useGatewayService: socket is null. make sure to connect")
                // Queue subscription if socket isnt ready
                set(state => {
                    state.subscriptionQueue.push({ topic, callback });
                });
                return;
            }
            
            socket.send(JSON.stringify({
                action: 'subscribe', topic
            }))
            SOCKET_ON_MESSAGE_CALLBACK_REGISTRY[topic] = callback;
        }
    }))
)
useGatewayService.getState().subscribeToTopic("dashboard_health", () => {
    
})