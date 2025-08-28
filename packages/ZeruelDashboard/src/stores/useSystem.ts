import { create } from "zustand";
import { immer } from "zustand/middleware/immer"
import { WorkflowStatusAPI } from "@zeruel/types";

export type DashboardPages = "scraper" | "enrichment" | "tables" | "trendsanalysis" | "health"

export type State = {
    overrideStage:          WorkflowStatusAPI.Stage.Type | null
    setOverrideStage:       (stage: WorkflowStatusAPI.Stage.Type | null, timeoutMs?: number) => Promise<void>
    currentPage:            DashboardPages
    isDatabaseReachable:    boolean
    isServiceReachable:     boolean
}

export type Actions = {
    setCurrentPage:         (value: DashboardPages) => void
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

            return new Promise<void>((resolve) => {
                if (value !== null && timeoutMs && timeoutMs > 0) {
                    overrideTimeout = setTimeout(() => {
                        set(s => { s.overrideStage = null });
                        overrideTimeout = null;
                        resolve();
                    }, timeoutMs);
                } else {
                    resolve();
                }
            });
        },
        currentPage: "scraper",
        setCurrentPage: (value) => set(s => { s.currentPage = value }),
        isDatabaseReachable: false,
        isServiceReachable: false
    }))
)

const POLLING_INTERVAL_MS = 20000; // 20 seconds
