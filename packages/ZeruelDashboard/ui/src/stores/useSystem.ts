import { create } from "zustand";
import { immer } from "zustand/middleware/immer"

export type DashboardPages = "scraper" | "tables" | "trendsanalysis" | "health"

export type State = {
    currentPage: DashboardPages
}

export type Actions = {
    setCurrentPage: (value: "scraper" | "tables" | "trendsanalysis" | "health") => void
}

export const useSystem = create<State & Actions>()(
    immer((set) => ({
        currentPage: "scraper",
        setCurrentPage: (value) => set(state => { state.currentPage = value })
    }))
)