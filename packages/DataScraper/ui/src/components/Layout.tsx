import React from 'react'
import VexrLogo from '../ui/components/VexrLogo'
import MenubarComponent from './MenubarComponent'
import { DotPattern } from '../ui/components/DotPattern'
import { useUIManagerAPI } from '../ui/UIManager/store'
import AuroraBackground from '../ui/components/AuroraBackground'
import { UIManagerDialogLayer } from '../ui/UIManager/ui'

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