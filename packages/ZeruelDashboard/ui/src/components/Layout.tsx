import React, { memo } from 'react'
import VexrLogo from '@zeruel/shared-ui/VexrLogo'
import MenubarComponent from './MenubarComponent'
import { DotPattern } from '@zeruel/shared-ui/DotPattern'
import { useUIManagerAPI } from '@zeruel/shared-ui/UIManager/store'
import AuroraBackground from "./AuroraBackground"
import { UIManagerDialogLayer } from '@zeruel/shared-ui/UIManager/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StarsBackground } from './StarsBackground'
import { cn } from '@zeruel/shared-ui/utils/cn'
import TabSwitcher from './PageSwitcher'
import { useSystem } from '@/stores/useSystem'
import classNames from 'classnames'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}

const queryClient = new QueryClient()

const Layout: React.FC<Props> = memo(({ children, className, ...rest }) => {
    const theme = useUIManagerAPI(state => state.theme)

    const currentPage = useSystem(state => state.currentPage)

    return (
        <QueryClientProvider client={queryClient}>
            <div 
                className={classNames(
                    `relative bg-neutral-950 ${theme} ${className}`,
                    // {"!bg-blue-900/20": currentPage === "scraper"}
                )} {...rest}
            >
                {/* Aurora as independent background layer */}
                <AuroraBackground asLayer 
                  
                />
                <div className={classNames(
                    'pointer-events-none absolute inset-0 bg-transparent transition-bg duration-500 ease-in-out',
                    {"!bg-cyan-900/20": currentPage === "scraper"},
                    {"!bg-black/60": currentPage === "tables"},
                    {"!bg-blue-950/20": currentPage === "trendsanalysis"},
                    {"!bg-indigo-500/10": currentPage === "health"},
                )}/>
                {/* Background */}
                {/* <div
                    className='pointer-events-none absolute inset-0'
                    style={{background: 'radial-gradient(ellipse at bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',}}
                /> */}
                <VexrLogo className={`pointer-events-none ${theme === "dark" && "!text-white/3"} ${theme === "light" && "!text-black/3 "} h-[100px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2`} />
                <DotPattern className={cn(
                    "pointer-events-none fill-neutral-200/20 [mask-image:radial-gradient(60vw_circle_at_center,white,transparent)]",
                )} />

                <UIManagerDialogLayer />
                <div className='fixed left-1/2 -translate-x-1/2 w-fit z-10 bottom-10'>
                    <TabSwitcher/>
                </div>
                <MenubarComponent />
                {children}
            </div>

        </QueryClientProvider>
    )
})

export default Layout