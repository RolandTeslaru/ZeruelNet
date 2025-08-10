import React from 'react'
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

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}

const queryClient = new QueryClient()

const Layout: React.FC<Props> = ({ children, className, ...rest }) => {
    const theme = useUIManagerAPI(state => state.theme)

    return (
        <QueryClientProvider client={queryClient}>
            <div 
                className={`bg-neutral-950 ${theme} ${className}`} {...rest}
            >
                <AuroraBackground>
                    <UIManagerDialogLayer />
                    <div className='fixed w-fit z-1 bottom-10'>
                        <TabSwitcher/>
                    </div>
                    <MenubarComponent />

                    {children}
                    {/* Backgruond */}
                    <div className='absolute size-full' style={{background: 'radial-gradient(ellipse at bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',}}/>
                    <VexrLogo className={`${theme === "dark" && "!text-white/3"} ${theme === "light" && "!text-black/3 "} h-[100px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2`} />
                    <DotPattern className={cn(
                        "fill-neutral-200/20 [mask-image:radial-gradient(60vw_circle_at_center,white,transparent)]",
                    )} />
                </AuroraBackground>
            </div>

        </QueryClientProvider>
    )
}

export default Layout