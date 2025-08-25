import React, { createContext, useContext } from "react";
import { WindowContext } from ".";

export interface WindowStylingProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    isDetached?: boolean;
    detachedClassName?: string
    detachedStyling?: React.CSSProperties
    contentClassName?: string
}

export interface VXEngineWindowProps{
    title?: string;
    noPadding?: boolean
    vxWindowId: string;
    windowClasses: string;
    noStyling?: boolean
    isAttached?: boolean
    isOpen?: boolean
    showControls?: boolean
    children?: React.ReactNode
    StylingComponent?: React.ReactElement<WindowStylingProps>
}




export interface WindowContextProps {
    vxWindowId: string
    externalContainer: HTMLElement | null
    setExternalContainer: (element: HTMLElement | null) => void
}

export interface DetachableWindowProps {
    children: React.ReactNode;
    onClose: () => void;
    windowClasses: string;
    title: string;
}

export const useWindowContext = () => useContext(WindowContext);