import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useWebSocket } from "./useWebSocket";

export interface LogMessage {
    level: 'info' | 'error' | 'warn' | 'success' | 'debug';
    message: string;
    timestamp: string;
}

type State = {
    messages: LogMessage[]
} 

type Actions = {
    clear: () => void
}


export const useLogMessages = create<State & Actions>()(
    immer((set, get) => ({
        messages: [],
        clear: () => set((state) => {
            state.messages = [];
        })
    }))
)

useWebSocket.getState().subscribeToTopic("scraper_logs", (data: LogMessage) => {
    useLogMessages.setState(state => {
        state.messages.push(data);
    })
})