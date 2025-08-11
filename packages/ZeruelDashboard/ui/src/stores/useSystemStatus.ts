import { SystemStage, SystemStep, StageType, T_SystemStatusPayload } from '@zeruel/scraper-types';
import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useGatewayService, webSocketEvents } from "./useGatewayService";
import { enableMapSet } from 'immer';
import { DashboardPages } from './useSystem';

enableMapSet();


type State = {
    pageStages: Record<DashboardPages, SystemStage>
    pageSteps: Record<DashboardPages, Map<string, SystemStep>>
} 

type Actions = {
}

export const useSystemStatus = create<State & Actions>()(
    immer((set, get) => ({

        pageStages: {
            scraper : {
                type: "INFO",
                title: `IDLE:  CONNECTING  TO  SERVER`, // scraper service
            },
            tables : {
                type: "INFO",
                title: `IDLE:  CONNECTING  TO  DATABASE`, // postgreSql database
            },
            trendsanalysis : {
                type: "INFO",
                title: `IDLE:  CONNECTING  TO  SERVER`, // dashboard service
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
        }
    }))
)

function handleSocketMessage(payload: T_SystemStatusPayload, currentPage: DashboardPages) {
    switch (payload.action) {
        case "UPDATE_STEP":
            useSystemStatus.setState(state => {
                state.pageSteps[currentPage].set(payload.stepId, payload.step);
            });
            break;
        case "SET_STAGE":
            useSystemStatus.setState(state => {
                state.pageStages[currentPage] = payload.stage;
                Object.entries(payload.steps).forEach(([stepKey, newStep]) => {
                    state.pageSteps[currentPage].set(stepKey, newStep)
                })
                // state.steps = new Map(Object.entries(payload.steps));
            });
            break;
        case "CLEAR_STEPS":
            useSystemStatus.setState(state => {
                state.pageSteps[currentPage].clear();
            });
            break;
        case "REMOVE_STEP":
            const { delayMs, stepId, status, description } = payload
            if(delayMs){
                useSystemStatus.setState(state => {
                    const step = state.pageSteps[currentPage].get(stepId);
                    step.status = status
                    if (description)
                        step.description = description
                })

                // delay te actual removal so the user can see the new status
                setTimeout(() => {
                    useSystemStatus.setState(state => {
                        state.pageSteps[currentPage].delete(stepId);
                    })
                }, delayMs)
            } else {
                useSystemStatus.setState(state => {
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
//         useSystemStatus.setState(state => {
//             state.stage = {
//                 type: "INFO",
//                 title: "IDLE:  AWAITING  TASK  WORK"
//             }
//         })
//     },
//     1000)
// })