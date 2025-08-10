import { create } from "zustand";
import { immer } from "zustand/middleware/immer"

type State = {
    currentPage: "scraper" | "tables" | "trendsanalysis" | "health"
}

type Actions = {
    setCurrentPage: (value: "scraper" | "tables" | "trendsanalysis" | "health") => void
}

export const useSystem = create<State & Actions>()(
    immer((set) => ({
        currentPage: "scraper",
        setCurrentPage: (value) => set(state => state.currentPage = value)
    }))
)