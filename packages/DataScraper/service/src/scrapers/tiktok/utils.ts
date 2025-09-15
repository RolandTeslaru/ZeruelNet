import { Page } from "playwright";

// A way to block the exection of the program, think like a timeout
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const checkIfUrlIsVideo = (href: string) => {
    return href.split("/").includes("video");
}


export const extractAllHrefs = async (page: Page, selectorId: string) => {
    return page.evaluate(selector => {
        const elements = document.querySelectorAll(selector);
        const hrefs: string[] = [];

        elements.forEach(el => {
            if(el instanceof HTMLAnchorElement && el.href)
                hrefs.push(el.href);
        })

        return hrefs;
    }, selectorId)
}


export const extractVideoIdFromUrl = (videoUrl: string): string => {
    return videoUrl.split('/').pop()
}