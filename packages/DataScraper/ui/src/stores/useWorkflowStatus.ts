import { T_SystemStatusPayload } from '@zeruel/scraper-types';
import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useGatewayService, webSocketEvents } from "./useGatewayService";
import { enableMapSet } from 'immer';
import { WorkflowStatusStage, WorkflowStatusStep } from '@zeruel/types';

enableMapSet();

type State = {
    stage: WorkflowStatusStage
    steps: Map<string, WorkflowStatusStep>
} 

type Actions = {
}

export const useWorkflowStatus = create<State & Actions>()(
    immer((set, get) => ({
        stage: {
            type: "INFO",
            title: `IDLE:  CONNECTING  TO  SERVER`,
        },
        steps: new Map()
    }))
)

function handleSocketMessage(payload: T_SystemStatusPayload) {
    switch (payload.action) {
        case "UPDATE_STEP":
            useWorkflowStatus.setState(state => {
                state.steps.set(payload.stepId, payload.step);
            });
            break;
        case "SET_STAGE":
            useWorkflowStatus.setState(state => {
                state.stage = payload.stage;
                Object.entries(payload.steps).forEach(([stepKey, newStep]) => {
                    state.steps.set(stepKey, newStep)
                })
                // state.steps = new Map(Object.entries(payload.steps));
            });
            break;
        case "CLEAR_STEPS":
            useWorkflowStatus.setState(state => {
                state.steps.clear();
            });
            break;
        case "REMOVE_STEP":
            const { delayMs, stepId, status, description } = payload
            if(delayMs){
                useWorkflowStatus.setState(state => {
                    const step = state.steps.get(stepId);
                    step.status = status
                    if (description)
                        step.description = description
                })

                // delay te actual removal so the user can see the new status
                setTimeout(() => {
                    useWorkflowStatus.setState(state => {
                        state.steps.delete(stepId);
                    })
                }, delayMs)
            } else {
                useWorkflowStatus.setState(state => {
                    const step = state.steps.get(stepId);
                    step.status = status
                    if (description)
                        step.description = description
                    state.steps.delete(stepId);
                })
            }
            break;
    }
}


useGatewayService.getState().subscribeToTopic("scraper_system_status", handleSocketMessage)
webSocketEvents.addEventListener("open", () => {
    setTimeout(() => {
        useWorkflowStatus.setState(state => {
            state.stage = {
                type: "INFO",
                title: "IDLE:  AWAITING  TASK  WORK"
            }
        })
    },
    1000)
})