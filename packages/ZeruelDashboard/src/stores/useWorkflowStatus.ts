import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useGatewayService, webSocketEvents } from "./useGatewayService";
import { enableMapSet } from 'immer';
import { DashboardPages } from './useSystem';
import { WorkflowStatusAPI } from "@zeruel/types";

enableMapSet();


type State = {
    pageStages: Record<DashboardPages, WorkflowStatusAPI.Stage.Type>
    pageSteps: Record<DashboardPages, Map<string, WorkflowStatusAPI.Step.Type>>
} 

type Actions = {
    setPageStage: (page: DashboardPages, stage: WorkflowStatusAPI.Stage.Type) => void
}

export const useWorkflowStatus = create<State & Actions>()(
    immer((set, get) => ({

        pageStages: {
            scraper : {
                variant: "INFO",
                title: `IDLE:  AWAITING  WORKFLOW  REQUEST`, // scraper service
            },
            enrichment: {
                variant: "INFO",
                title: "IDLE:  AWAITING  TASK"
            },
            tables : {
                variant: "INFO",
                title: `IDLE:  CONNECTED  TO  DATABASE`, // postgreSql database
            },
            trendsanalysis : {
                variant: "INFO",
                title: `IDLE:  AWAITING  TASK`, // dashboard service
            },
            health : {
                variant: "INFO",
                title: `IDLE:  NO  DATA`, // nothing
            },
        },
        pageSteps: {
            scraper: new Map(),
            enrichment: new Map(),
            tables: new Map(),
            trendsanalysis: new Map(),
            health: new Map(),
        },
        setPageStage: (page, stage) => set(s => {
            if(!s.pageStages[page]) return
            s.pageStages[page] = stage
        })
    }))
)

function handleSocketMessage(payload: WorkflowStatusAPI.Payload.Type, currentPage: DashboardPages) {    
    switch (payload.action) {
        case "UPDATE_STEP":
            useWorkflowStatus.setState(state => {
                const oldStep = state.pageSteps[currentPage].get(payload.stepId)

                const newStep: WorkflowStatusAPI.Step.Type = {
                    ...oldStep,
                    ...payload.step
                }
                state.pageSteps[currentPage].set(payload.stepId, newStep);
            });
            break;
        case "SET_STAGE":
            useWorkflowStatus.setState(state => {
                state.pageStages[currentPage] = payload.stage;
                Object.entries(payload.steps).forEach(([stepKey, newStep]) => {
                    state.pageSteps[currentPage].set(stepKey, newStep)
                })
                // state.steps = new Map(Object.entries(payload.steps));
            });
            break;
        case "CLEAR_STEPS":
            useWorkflowStatus.setState(state => {
                state.pageSteps[currentPage].clear();
            });
            break;
        case "REMOVE_STEP":
            const { delayMs, stepId, step } = payload
            if(delayMs){
                useWorkflowStatus.setState(state => {
                    const oldStep = state.pageSteps[currentPage].get(stepId);

                    const newStep = {
                        ...oldStep,
                        ...step
                    }
                    
                    state.pageSteps[currentPage].set(payload.stepId, newStep);
                })

                // delay te actual removal so the user can see the new status
                setTimeout(() => {
                    useWorkflowStatus.setState(state => {
                        state.pageSteps[currentPage].delete(stepId);
                    })
                }, delayMs)
            } else {
                useWorkflowStatus.setState(state => {
                    const oldStep = state.pageSteps[currentPage].get(stepId);

                    const newStep = {
                        ...oldStep,
                        ...step
                    }
                    
                    state.pageSteps[currentPage].set(payload.stepId, newStep);
                })
            }
            break;
    }
}


useGatewayService.getState().subscribeToTopic("scraper_system_status", (payload) => {handleSocketMessage(payload, "scraper")})
useGatewayService.getState().subscribeToTopic("dashboard_system_status", (payload) => {handleSocketMessage(payload, 'trendsanalysis')})
// webSocketEvents.addEventListener("open", () => {
//     setTimeout(() => {
//         useWorkflowStatus.setState(state => {
//             state.stage = {
//                 type: "INFO",
//                 title: "IDLE:  AWAITING  TASK  WORK"
//             }
//         })
//     },
//     1000)
// })