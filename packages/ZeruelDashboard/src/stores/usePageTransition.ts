import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { DashboardPages, useSystem } from "./useSystem";
import { gsap } from "gsap"

type PageKey = DashboardPages

type State = {
}

type Actions = {
    transition: (args: { 
        toPage: PageKey; 
        exitAnimationDelay?: boolean
        enterAnimationDelay?: boolean
        bgAnimationDelay?: boolean 
    }) => void
}

const DEFAULTS: GSAPTweenVars = { duration: 0.3, ease: "power2.inOut" } 

const SCRAPER_PAGE_SELECTOR = "#ZN-DataScraper-StepperPanel, #ZN-DataScraper-MissionPanel, #ZN-DataScraper-CommandPanel"
const ENRICHMENT_PAGE_SELECTOR = "#ZN-Enrichment-TablePanel, #ZN-Enrichment-DataPanel"
const TABLES_PAGE_SELECTOR = "#ZN-Dashboard-Database-Tree-Panel, #ZN-Dashboard-Database-Table-Viewer, #ZN-Dashboard-Database-Query-Panel"
const TRENDS_PAGE_SELECTOR = "#ZN-Trends-LeftPanel, #ZN-Trends-Timeline, #ZN-Trends-Main, #ZN-Trends-Right"

const showPage = (pageKey: PageKey): GSAPTimeline => {
    switch(pageKey){
        case "scraper":
            return gsap.timeline()
                .set("#ZN-DataScraper", { display: "flex" })
                .set("#ZN-Tables, #ZN-Health, #ZN-Trends, #ZN-Enrichment", { display: "none" })
        case "enrichment":
            return gsap.timeline()
                .set("#ZN-Enrichment", { display: "flex" })
                .set("#ZN-Tables, #ZN-Health, #ZN-Trends, #ZN-DataScraper", { display: "none" })
        case "tables":
            return gsap.timeline()
                .set("#ZN-Tables", { display: "flex" })
                .set("#ZN-DataScraper, #ZN-Health, #ZN-Trends, #ZN-Enrichment", { display: "none" })
        case "trendsanalysis":
            return  gsap.timeline()
                .set("#ZN-Trends", { display: "grid" })
                .set("#ZN-Tables, #ZN-Health, #ZN-DataScraper, #ZN-Enrichment", { display: "none" })
        case "health":
            return  gsap.timeline()
                .set("#ZN-Health", { display: "flex" })
                .set("#ZN-Tables, #ZN-DataScraper, #ZN-Trends, #ZN-Enrichment", { display: "none" })
    }
}

const createIntroTimeline = (pageKey: PageKey): GSAPTimeline => {
    switch (pageKey) {
        case "scraper":
            return gsap.timeline({ defaults: DEFAULTS })
                .set(SCRAPER_PAGE_SELECTOR, {
                    display: "flex",
                    delay: 0.3,
                    opacity: 0,
                    scale: 0.5
                })
                .to(SCRAPER_PAGE_SELECTOR, {
                    opacity: 1, scale: 1
                });
        case "enrichment":
            return gsap.timeline({ defaults: DEFAULTS })
                .set(ENRICHMENT_PAGE_SELECTOR, {
                    display: "flex",
                    delay: 0.3,
                    opacity: 0,
                    scale: 0.5
                })
                .to(ENRICHMENT_PAGE_SELECTOR, {
                    opacity: 1, scale: 1
                })
        case "tables":
            return gsap.timeline({ defaults: DEFAULTS })
                .set(TABLES_PAGE_SELECTOR, {
                    display: "flex",
                    delay: 0.3,
                    opacity: 0,
                    scale: 0.5
                })
                .to(TABLES_PAGE_SELECTOR, {
                    opacity: 1, scale: 1
                });
        case "trendsanalysis":
            return gsap.timeline({ defaults: DEFAULTS })
                .set(TRENDS_PAGE_SELECTOR, {
                    display: "flex",
                    delay: 0.3,
                    opacity: 0,
                    scale: 0.5
                })
                .to(TRENDS_PAGE_SELECTOR, {
                    opacity: 1, scale: 1
                })
        default:
            return gsap.timeline().fromTo("something", {}, {});
    }
}

const createOutroTimeline = (pageKey: PageKey): GSAPTimeline => {
    switch (pageKey) {
        case "scraper":
            return gsap.timeline({ defaults: DEFAULTS })
                .to(SCRAPER_PAGE_SELECTOR, {
                    opacity: 0, scale: 0.5
                })
                .set(SCRAPER_PAGE_SELECTOR, {
                    display: "none"
                })
                .set("#ZN-DataScraper", {
                    display: "none"
                })
        case "enrichment":
            return gsap.timeline({ defaults: DEFAULTS})
                .to(ENRICHMENT_PAGE_SELECTOR, {
                    opacity: 0, scale: 0.5
                })
                .set(ENRICHMENT_PAGE_SELECTOR, {
                    display: "none"
                })
                .set("#ZN-Enrichment", {
                    display: "none"
                })
        case "tables":
            return gsap.timeline({ defaults: DEFAULTS })
                .to(TABLES_PAGE_SELECTOR, {
                    opacity: 0, scale: 0.5
                })
                .set(TABLES_PAGE_SELECTOR, {
                    display: "none"
                })
                .set("#ZN-Tables", {
                    display: "none"
                })
        case "trendsanalysis":
            return gsap.timeline({ defaults: DEFAULTS })
                .to(TRENDS_PAGE_SELECTOR, {
                    opacity: 0, scale: 0.5
                })
                .set(TABLES_PAGE_SELECTOR, {
                    display: "none"
                })
                .set("#ZN-Trends", {
                    display: "none"
                })
        default:
            return gsap.timeline().fromTo("something", {}, {});
    }
}

export const usePageTransition = create<State & Actions>()(
    immer((set, get) => ({
        transition: ({ toPage, exitAnimationDelay, bgAnimationDelay, enterAnimationDelay }) => {
            const currentPage = useSystem.getState().currentPage;

            const exitAnimation = createOutroTimeline(currentPage);
            exitAnimation
                .restart(exitAnimationDelay)
                .then(() => {
                    // console.log("Finsihed EXIT")
                    showPage(toPage).restart()
                    useSystem.getState().setCurrentPage(toPage);

                    // Wait for React to render the new components
                    requestAnimationFrame(() => {
                        const enterAnimation = createIntroTimeline(toPage);
                        enterAnimation.restart(enterAnimationDelay)
                    });
                })
        }
    }))
)