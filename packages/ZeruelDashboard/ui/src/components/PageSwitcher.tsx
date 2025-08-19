import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@zeruel/shared-ui/foundations'
import { DashboardPages, useSystem } from '@/stores/useSystem'
import { Activity, Bot, Health, Sparkles, Table } from '@zeruel/shared-ui/icons'
import { usePageTransition } from '@/stores/usePageTransition'

const PageSwitcher = () => {

    const [currentPage, setCurrentPage] = useSystem(state => [state.currentPage, state.setCurrentPage])

    const transition = usePageTransition(state => state.transition)

    return (
        <div className='relative p-0.5 border border-neutral-400/20 rounded-full'>
            <Tabs
                value={currentPage}
                onValueChange={(value) => {
                    transition({
                        toPage: value as DashboardPages,
                        enterAnimationDelay: false,
                        bgAnimationDelay: false,
                        exitAnimationDelay: false
                    })
                }}
            >
                <TabsList className='gap-2 !bg-neutral-800/40 !border-primary-thin' indicatorClassname='!bg-blue-500 !border-blue-500' indicatorStyle={{boxShadow: "0px 0px 10px 3px oklch(0.623 0.214 259.815" }}
                >
                    <TabsTrigger className='px-2.5 py-1.5 gap-1 font-normal tracking-wider' value="scraper">
                        <Bot strokeWidth={1.5} size={20}/>
                        SCRAPER
                    </TabsTrigger>
                    <TabsTrigger className='px-2.5 py-1.5 gap-1 font-normal tracking-wider' value="enrichment">
                        <Sparkles strokeWidth={1.5} size={20}/>
                        ENRICHMENT
                    </TabsTrigger>
                    <TabsTrigger className='px-2.5 py-1.5 gap-1 font-normal tracking-wider' value="tables">
                        <Table strokeWidth={1.5} size={20}/>
                        TABLES
                    </TabsTrigger>
                    <TabsTrigger className='px-2.5 py-1.5 gap-1 font-normal tracking-wider' value="trendsanalysis">
                        <Activity strokeWidth={1.5} size={20}/>
                        TRENDS & ANALYSIS
                    </TabsTrigger>
                    <TabsTrigger className='px-2.5 py-1.5 gap-1 font-normal tracking-wider' value="health">
                        <Health strokeWidth={1.5} size={20}/>
                        SYS. HEALTH
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}

export default PageSwitcher