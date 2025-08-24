import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { useWorkflowStatus } from "./useWorkflowStatus";
import { WorkflowStatusStage } from "@zeruel/types";

export type DashboardPages = "scraper" | "enrichment" | "tables" | "trendsanalysis" | "health"

export type State = {
    overrideStage: WorkflowStatusStage | null
    setOverrideStage: (stage: WorkflowStatusStage | null, timeoutMs?: number) => void
    currentPage: DashboardPages
    isDatabaseReachable: boolean
    isServiceReachable: boolean
}

export type Actions = {
    setCurrentPage: (value: DashboardPages) => void
}

let overrideTimeout: NodeJS.Timeout | null = null;

export const useSystem = create<State & Actions>()(
    immer((set) => ({
        overrideStage: null,
        setOverrideStage: (value, timeoutMs) => {
            // Clear existing timeout
            if (overrideTimeout) {
                clearTimeout(overrideTimeout);
                overrideTimeout = null;
            }

            set(s => { s.overrideStage = value });

            if (value !== null && timeoutMs && timeoutMs > 0) {
                overrideTimeout = setTimeout(() => {
                    set(s => { s.overrideStage = null });
                    overrideTimeout = null;
                }, timeoutMs);
            }
        },
        currentPage: "scraper",
        setCurrentPage: (value) => set(s => { s.currentPage = value }),
        isDatabaseReachable: false,
        isServiceReachable: false
    }))
)

const POLLING_INTERVAL_MS = 20000; // 20 seconds
