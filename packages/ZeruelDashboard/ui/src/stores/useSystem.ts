import { api } from "@/lib/api";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useWorkflowStatus } from "./useWorkflowStatus";
import { WorkflowStatusStage } from "@zeruel/types";

export type DashboardPages = "scraper" | "tables" | "trendsanalysis" | "health"

export type State = {
    overrideStage: WorkflowStatusStage | null
    setOverrideStage: (stage: WorkflowStatusStage | null) => void
    currentPage: DashboardPages
    isDatabaseReachable: boolean
}

export type Actions = {
    setCurrentPage: (value: "scraper" | "tables" | "trendsanalysis" | "health") => void
}

export const useSystem = create<State & Actions>()(
    immer((set) => ({
        overrideStage: null,
        setOverrideStage: (value) => set(s => { s.overrideStage = value }),
        currentPage: "scraper",
        setCurrentPage: (value) => set(s => { s.currentPage = value }),
        isDatabaseReachable: false,
        isServiceReachable: false
    }))
)


const checkIsServiceReachable = async () => {
    console.log("Checking if service is reachable")
    const setOverrideStage = useSystem.getState().setOverrideStage;
    try {
        const response = await api.get("/health")
        if (response.status === 200) {
            setOverrideStage(null)
        }
    } catch (e) {
        console.log("Service check response ", e)
        useSystem.setState(s => {s.isDatabaseReachable = false})
        setOverrideStage({ type: "FAILURE", title: "ERROR:  FAILED  TO  REACH  SERVICE" })
        setTimeout(() => {
            setOverrideStage({ type: "STANDBY", title: "STANDBY:  RETRYING  SERVICE  IN  20s"})
        }, 3500)
    }
}

checkIsServiceReachable()

const checkIsDatabaseReachable = async () => {
    console.log("Attempting to communcaite with database")
    const setPageStage = useWorkflowStatus.getState().setPageStage;
    try {
        const response = await api.get(`/health/database`)
        if (response.status === 200) {
            setPageStage("tables", { type: "INFO", title: "IDLE:  CONNECTED  TO  DATABASE" })
            useSystem.setState(s => {s.isDatabaseReachable = true})
        }
    } catch (e) {
        useSystem.setState(s => {s.isDatabaseReachable = false})
        setPageStage("tables", { type: "FAILURE", title: "ERROR:  FAILED  TO  REACH  DATABASE" })
        
    }
}

checkIsDatabaseReachable()