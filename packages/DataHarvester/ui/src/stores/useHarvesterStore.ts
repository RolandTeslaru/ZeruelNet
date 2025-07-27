import { create } from 'zustand';
import { Video, SystemStatusUpdate } from '@zeruel/harvester-types';

export interface LogMessage {
    level: 'info' | 'error' | 'warn' | 'success' | 'debug';
    message: string;
    timestamp: string;
}

export interface HarvesterState {
    socket: WebSocket | null;
    isConnected: boolean;
    logMessages: LogMessage[];
    systemStatus: SystemStatusUpdate | null;
    scrapedVideos: Video[];
    connect: () => void;
    disconnect: () => void;
}

const WS_URL = 'ws://localhost:4000';

export const useHarvesterStore = create<HarvesterState>((set, get) => ({
    socket: null,
    isConnected: false,
    logMessages: [],
    scrapedVideos: [],
    systemStatus: null,
    connect: () => {
        if (get().socket) return;

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            set({ isConnected: true, socket: ws });
            
            // Subscribe to the topics we care about
            ws.send(JSON.stringify({ action: 'subscribe', topic: 'harvester_logs' }));
            ws.send(JSON.stringify({ action: 'subscribe', topic: 'harvester_live_feed' }));
            ws.send(JSON.stringify({ action: 'subscribe', topic: 'harvester_summary' }));
            ws.send(JSON.stringify({ action: 'subscribe', topic: 'harvester_system_status' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Check if it's a system status update
            if (data.stage && data.steps) {
                set({ systemStatus: data as SystemStatusUpdate });
                return;
            }
            
            // Handle structured logs
            if (data.level && data.message) {
                set(state => ({ logMessages: [...state.logMessages, data as LogMessage] }));
            }

            // Handle rich events from the live feed
            if (data.type === 'new_video_scraped') {
                set(state => ({ 
                    scrapedVideos: [data.video, ...state.scrapedVideos]
                }));
            }

            // Handle the final report
            if (data.type === 'run_complete') {
                 set(state => ({ logMessages: [...state.logMessages, {
                     level: 'success',
                     message: `--- RUN COMPLETE --- New: ${data.report.newVideosScraped}, Updated: ${data.report.videosUpdated}`,
                     timestamp: new Date().toISOString()
                 }]}));
            }
        };

        ws.onclose = () => {
            set({ isConnected: false, socket: null });
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    },
    disconnect: () => {
        get().socket?.close();
    },
})); 