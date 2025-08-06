import React from 'react'
import VexrLogo from '@zeruel/shared-ui/VexrLogo'
import MenubarComponent from './MenubarComponent'
import { DotPattern } from '@zeruel/shared-ui/DotPattern'
import { useUIManagerAPI } from '@zeruel/shared-ui/UIManager/store'
import AuroraBackground from '@zeruel/shared-ui/AuroraBackground'
import { UIManagerDialogLayer } from '@zeruel/shared-ui/UIManager/ui'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}

const Layout: React.FC<Props> = ({ children, className, ...rest }) => {
    const theme = useUIManagerAPI(state => state.theme)

    return (
        <div className={`bg-gray-950 ${theme} ${className}`} {...rest}>
            <AuroraBackground>
                <UIManagerDialogLayer />
                <MenubarComponent />
                <VexrLogo className={`${theme === "dark" && "!text-white/3"} ${theme === "light" && "!text-black/3 "} h-[100px] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2`} />
                <DotPattern />
                {children}

            </AuroraBackground>
        </div>
    )
}

export default Layout