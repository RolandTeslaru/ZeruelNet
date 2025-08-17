import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useGatewayService, webSocketEvents } from "./useGatewayService";
import { enableMapSet } from 'immer';
import { DashboardPages } from './useSystem';
import { WorkflowStatusStage, WorkflowStatus, WorkflowStatusStep } from '@zeruel/types';
import { WorkflowStatusPayload } from "@zeruel/scraper-types";

enableMapSet();


type State = {
    pageStages: Record<DashboardPages, WorkflowStatusStage>
    pageSteps: Record<DashboardPages, Map<string, WorkflowStatusStep>>
} 

type Actions = {
    setPageStage: (page: DashboardPages, stage: WorkflowStatusStage) => void
}

export const useWorkflowStatus = create<State & Actions>()(
    immer((set, get) => ({

        pageStages: {
            scraper : {
                type: "INFO",
                title: `IDLE:  AWAITING  SCRAPE  TASK`, // scraper service
            },
            tables : {
                type: "INFO",
                title: `IDLE:  CONNECTED  TO  DATABASE`, // postgreSql database
            },
            trendsanalysis : {
                type: "INFO",
                title: `IDLE:  AWAITING  TASK`, // dashboard service
            },
            health : {
                type: "INFO",
                title: `IDLE:  NO  DATA`, // nothing
            },
        },
        pageSteps: {
            scraper: new Map(),
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

function handleSocketMessage(payload: WorkflowStatusPayload, currentPage: DashboardPages) {
    switch (payload.action) {
        case "UPDATE_STEP":
            useWorkflowStatus.setState(state => {
                state.pageSteps[currentPage].set(payload.stepId, payload.step);
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
            const { delayMs, stepId, status, description } = payload
            if(delayMs){
                useWorkflowStatus.setState(state => {
                    const step = state.pageSteps[currentPage].get(stepId);
                    step.status = status
                    if (description)
                        step.description = description
                })

                // delay te actual removal so the user can see the new status
                setTimeout(() => {
                    useWorkflowStatus.setState(state => {
                        state.pageSteps[currentPage].delete(stepId);
                    })
                }, delayMs)
            } else {
                useWorkflowStatus.setState(state => {
                    const step = state.pageSteps[currentPage].get(stepId);
                    step.status = status
                    if (description)
                        step.description = description
                    state.pageSteps[currentPage].delete(stepId);
                })
            }
            break;
    }
}


useGatewayService.getState().subscribeToTopic("scraper_system_status", payload =>  handleSocketMessage(payload, "scraper"))
useGatewayService.getState().subscribeToTopic("dashboard_system_status",  payload =>  handleSocketMessage(payload, 'trendsanalysis'))
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