"use client"
import React, { memo, useEffect } from 'react'
import VexrLogo from '@zeruel/shared-ui/VexrLogo'
import MenubarComponent from './MenubarComponent'
import { DotPattern } from '@zeruel/shared-ui/DotPattern'
import { useUIManagerAPI } from '@zeruel/shared-ui/UIManager/store'
import AuroraBackground from "./AuroraBackground"
import { UIManagerDialogLayer } from '@zeruel/shared-ui/UIManager/ui'
import { StarsBackground } from './StarsBackground'
import { cn } from '@zeruel/shared-ui/utils/cn'
import TabSwitcher from './PageSwitcher'
import { useSystem } from '@/stores/useSystem'
import classNames from 'classnames'
import StagePanel from './StagePanel'
import { useGatewayService } from '@/stores/useGatewayService'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}


const Layout: React.FC<Props> = memo(({ children, className, ...rest }) => {
    const theme = useUIManagerAPI(state => state.theme)
    useEffect(() => {
        useGatewayService.getState().connect();
    }, []);

    const currentPage = useSystem(state => state.currentPage)


    return (
        <div
            className={classNames(
                `relative bg-neutral-950 ${theme} ${className}`,
                // {"!bg-blue-900/20": currentPage === "scraper"}
            )} {...rest}
        >
            <AuroraBackground asLayer />
            <div className={classNames(
                'pointer-events-none absolute inset-0 bg-transparent transition-bg duration-500 ease-in-out',
                { "!bg-cyan-900/20": currentPage === "scraper" },
                { "!bg-black/60": currentPage === "tables" },
                { "!bg-blue-950/20": currentPage === "trendsanalysis" },
                { "!bg-indigo-500/10": currentPage === "health" },
            )}
                id="ZN-Layout-BackgroundColor"
            />
            {/* Background */}
            <div
                className='pointer-events-none absolute inset-0 transition-all duration-700 ease-in-out'
                style={{
                    background: 'radial-gradient(ellipse at bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
                    opacity: currentPage === "tables" ? 1 : 0
                }}
            />
            <VexrLogo className={`pointer-events-none ${theme === "dark" && "!text-white/3"} ${theme === "light" && "!text-black/3 "} h-[100px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2`} />
            <DotPattern className={cn(
                "pointer-events-none fill-neutral-200/20 [mask-image:radial-gradient(60vw_circle_at_center,white,transparent)]",
            )} />

            <UIManagerDialogLayer />
            <div className='fixed left-1/2 -translate-x-1/2 w-fit z-10 bottom-3'>
                <TabSwitcher />
            </div>
            <StagePanel />
            <MenubarComponent />
            {children}
        </div>
    )
})

export default Layout