import { SystemStage, SystemStep, StageType, T_SystemStatusPayload } from '@zeruel/scraper-types';
import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useWebSocket, webSocketEvents } from "./useWebSocket";
import { enableMapSet } from 'immer';

enableMapSet();

type State = {
    stage: SystemStage
    steps: Map<string, SystemStep>
} 

type Actions = {
}

export const useSystemStatus = create<State & Actions>()(
    immer((set, get) => ({
        stage: {
            type: "INFO",
            title: `IDLE: CONNECTING TO SERVER`,
        },
        steps: new Map()
    }))
)

function handleSocketMessage(data: T_SystemStatusPayload) {
    switch (data.action) {
        case "UPDATE_STEP":
            useSystemStatus.setState(state => {
                state.steps.set(data.stepId, data.step);
            });
            break;
        case "SET_STAGE":
            useSystemStatus.setState(state => {
                console.log
                state.stage =  data.stage;
                state.steps = new Map(Object.entries(data.steps));
            });
            break;
        case "CLEAR_STEPS":
            useSystemStatus.setState(state => {
                state.steps.clear();
            });
            break;
    }
}


useWebSocket.getState().subscribeToTopic("scraper_system_status", handleSocketMessage)
webSocketEvents.addEventListener("open", () => {
    setTimeout(() => {
        useSystemStatus.setState(state => {
            state.stage = {
                type: "INFO",
                title: "IDLE:  AWAITING  TASK  WORK"
            }
        })
    },
    1000)
})