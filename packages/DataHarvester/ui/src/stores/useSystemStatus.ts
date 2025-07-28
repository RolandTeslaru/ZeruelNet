import { SystemStage, SystemStep, StageType } from "@zeruel/harvester-types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useWebSocket, webSocketEvents } from "./useWebSocket";

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

type UpdateStepPayload = { action: "UPDATE_STEP", stepId: string, step: SystemStep };
type UpdateStagePayload = { action: "UPDATE_STAGE", title: string, type: StageType };
type ClearStepsPayload = { action: "CLEAR_STEPS" };

type SocketPayload = UpdateStepPayload | UpdateStagePayload | ClearStepsPayload;

function handleSocketMessage(data: SocketPayload) {
    switch (data.action) {
        case "UPDATE_STEP":
            useSystemStatus.setState(state => {
                state.steps.set(data.stepId, data.step);
            });
            break;
        case "UPDATE_STAGE":
            useSystemStatus.setState(state => {
                state.stage = { title: data.title, type: data.type };
            });
            break;
        case "CLEAR_STEPS":
            useSystemStatus.setState(state => {
                state.steps.clear();
            });
            break;
    }
}


useWebSocket.getState().subscribeToTopic("harvester_system_status", handleSocketMessage)
webSocketEvents.addEventListener("open", () => {
    setTimeout(() => {
        useSystemStatus.setState(state => {
            state.stage = {
                type: "INFO",
                title: "IDLE:  AWAITING  TASK  WORK"
            }
        })
    },
    1000

    )
})