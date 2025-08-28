import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useGatewayService, webSocketEvents } from "./useGatewayService";
import { enableMapSet } from 'immer';
import { WorkflowStatusAPI } from '@zeruel/types';

enableMapSet();

type State = {
    stage: WorkflowStatusAPI.Stage.Type
    steps: Map<string, WorkflowStatusAPI.Step.Type>
} 

type Actions = {
}

export const useWorkflowStatus = create<State & Actions>()(
    immer((set, get) => ({
        stage: {
            variant: "INFO",
            title: `IDLE:  CONNECTING  TO  SERVER`,
        },
        steps: new Map()
    }))
)

function handleSocketMessage(payload: WorkflowStatusAPI.Payload.Type) {
    switch (payload.action) {
        case "UPDATE_STEP":
            useWorkflowStatus.setState(state => {
                // The incoming step will be complete without missing properties
                const incomingStep = payload.step as WorkflowStatusAPI.Step.Type
                state.steps.set(payload.stepId, incomingStep);
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
            const { delayMs, stepId, step } = payload
            // The incoming step will be complete without missing properties
            const incomingStep = step as WorkflowStatusAPI.Step.Type
            useWorkflowStatus.setState(state => {
                state.steps.set(payload.stepId, incomingStep);
            })
            // delay te actual removal so the user can see the new status
            if(delayMs){
                setTimeout(() => {
                    useWorkflowStatus.setState(state => {
                        state.steps.delete(stepId);
                    })
                }, delayMs)
            }
            break;
    }
}


useGatewayService.getState().subscribeToTopic("scraper_system_status", handleSocketMessage)
webSocketEvents.addEventListener("open", () => {
    setTimeout(() => {
        useWorkflowStatus.setState(state => {
            state.stage = {
                variant: "INFO",
                title: "IDLE:  AWAITING  TASK  WORK"
            }
        })
    },
    1000)
})