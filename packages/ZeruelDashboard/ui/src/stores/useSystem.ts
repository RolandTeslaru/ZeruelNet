import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useWorkflowStatus } from "./useWorkflowStatus";
import { WorkflowStatusStage } from "@zeruel/types";
import { api } from "@/lib/api";

export type DashboardPages = "scraper" | "tables" | "trendsanalysis" | "health"

export type State = {
    overrideStage: WorkflowStatusStage | null
    setOverrideStage: (stage: WorkflowStatusStage | null) => void
    currentPage: DashboardPages
    isDatabaseReachable: boolean
    isServiceReachable: boolean
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

const POLLING_INTERVAL_MS = 20000; // 20 seconds

const healthCheck = async () => {
    const { setOverrideStage } = useSystem.getState();
    const { setPageStage } = useWorkflowStatus.getState();

    try {
        // Check if the backend service is reachable
        await api.get("/health");
        useSystem.setState(s => {s.isServiceReachable = true})

        setOverrideStage(null);

        // Check if database is reachable
        try {
            await api.get(`/health/database`);
            useSystem.setState(s => {s.isDatabaseReachable = true });
            setPageStage("tables", { type: "INFO", title: "IDLE:  CONNECTED  TO  DATABASE" });
        } catch (dbError) {
            useSystem.setState(s => { s.isDatabaseReachable = false });
            setPageStage("tables", { type: "FAILURE", title: "ERROR:  FAILED  TO  REACH  DATABASE" });
        }

    } catch (serviceError) {
        // This block runs if the service is down.
        useSystem.setState(s => {
            s.isDatabaseReachable = false
            s.isServiceReachable = false
        })
        setOverrideStage({ type: "FAILURE", title: "ERROR:  FAILED  TO  REACH  SERVICE" });
        // Timeout for retry 
        setTimeout(() => {
            const currentOverride = useSystem.getState().overrideStage;
            // Only switch to STANDBY if we are still in the failure state.
            if (currentOverride?.type === 'FAILURE') {
                setOverrideStage({ type: "STANDBY", title: `STANDBY:  RETRYING  SERVICE  IN  ${POLLING_INTERVAL_MS / 1000}s` });
            }
        }, 3500);
    }
};

// Health Check interval Mechanism
healthCheck();
setInterval(healthCheck, POLLING_INTERVAL_MS);
