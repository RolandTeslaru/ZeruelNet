import { AnimationPlaybackControls } from "motion/react";
import { useRef } from "react";
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
const TABLES_PAGE_SELECTOR = "#ZN-Dashboard-Database-Tree-Panel, #ZN-Dashboard-Database-Table-Viewer, #ZN-Dashboard-Database-Query-Panel"

const showPage = (pageKey: PageKey): GSAPTimeline => {
    switch(pageKey){
        case "scraper":
            return gsap.timeline()
                .set("#ZN-DataScraper", { display: "flex" })
                .set("#ZN-Tables, #ZN-Health, #ZN-Trends", { display: "none" })
        case "tables":
            return gsap.timeline()
                .set("#ZN-Tables", { display: "flex" })
                .set("#ZN-DataScraper, #ZN-Health, #ZN-Trends", { display: "none" })
        case "trendsanalysis":
            return  gsap.timeline()
                .set("#ZN-Trends", { display: "flex" })
                .set("#ZN-Tables, #ZN-Health, #ZN-DataScraper", { display: "none" })
        case "health":
            return  gsap.timeline()
                .set("#ZN-Health", { display: "flex" })
                .set("#ZN-Tables, #ZN-DataScraper, #ZN-Trends", { display: "none" })
    }
}

const createIntroTimeline = (pageKey: PageKey): GSAPTimeline => {
    switch (pageKey) {
        case "scraper":
            return gsap.timeline({ defaults: DEFAULTS })
                .set(SCRAPER_PAGE_SELECTOR, {
                    display: "flex",
                    delay: 1,
                    opacity: 0,
                    scale: 0.5
                })
                .to(SCRAPER_PAGE_SELECTOR, {
                    opacity: 1, scale: 1
                });
        case "tables":
            return gsap.timeline({ defaults: DEFAULTS })
                .set(TABLES_PAGE_SELECTOR, {
                    display: "flex",
                    delay: 1,
                    opacity: 0,
                    scale: 0.5
                })
                .to(TABLES_PAGE_SELECTOR, {
                    opacity: 1, scale: 1
                });
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
        default:
            return gsap.timeline().fromTo("something", {}, {});
    }
}

const BACKGROUND_ANIMATION: Record<PageKey, GSAPTimeline> = {
    "scraper": gsap.timeline({ defaults: DEFAULTS })
        .to("#ZN-Layout-BackgroundColor", {
            backgroundColor: "rgba(22, 78, 99, 0.2)", // bg-cyan-900/20
        }),
    "tables": gsap.timeline({ defaults: DEFAULTS })
        .to("#ZN-Layout-BackgroundColor", {
            backgroundColor: "rgba(0, 0, 0, 0.6)", // bg-blck/60
        }),
    "trendsanalysis": gsap.timeline({ defaults: DEFAULTS })
        .to("#ZN-Layout-BackgroundColor", {
            backgroundColor: "rgba(30, 58, 138, 0.2)", // bg-blue-900/20
        }),
    "health": gsap.timeline({ defaults: DEFAULTS })
        .to("#ZN-Layout-BackgroundColor", {
            backgroundColor: "rgba(99, 102, 241, 0.2)", // bg-blue-900/20
        }),
}

const emptyT = gsap.timeline().to("something", {})


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
                    const bgAnimation = BACKGROUND_ANIMATION[toPage] ?? emptyT
                    bgAnimation.
                        restart(bgAnimationDelay)
                        .then(() => {
                            // console.log("FINISHED BG")
                            useSystem.getState().setCurrentPage(toPage);

                            // Wait for React to render the new components
                            requestAnimationFrame(() => {
                                const enterAnimation = createIntroTimeline(toPage);
                                enterAnimation.restart(enterAnimationDelay)
                            });

                        })
                })
        }
    }))
)