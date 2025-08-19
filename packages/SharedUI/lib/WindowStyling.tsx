
import React from "react"
import { WindowStylingProps } from './VXWindow/useWindowContext';
import classNames from 'classnames';
import { DotPattern } from "./DotPattern";
import { AnimatePresence, HTMLMotionProps, motion, Variants } from 'motion/react'

export const CrossesWindowStyling: React.FC<WindowStylingProps & { crossesClassName?: string }> = ({
    className, style, children, isDetached = false, detachedClassName, detachedStyling, crossesClassName, ...rest
}) => {
    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'p-2 relative flex flex-col gap-2 border border-white/20',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                ...style,
            }}
            {...rest}
        >
            {isDetached && <DotPattern />}
            <CrossIcon className={classNames("absolute h-3 w-3 top-0 left-0 transform -translate-x-1/2 -translate-y-1/2", crossesClassName)} />
            <CrossIcon className={classNames("absolute h-3 w-3 top-0 right-0 transform translate-x-1/2 -translate-y-1/2", crossesClassName)} />
            <CrossIcon className={classNames("absolute h-3 w-3 bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2", crossesClassName)} />
            <CrossIcon className={classNames("absolute h-3 w-3 bottom-0 right-0 transform translate-x-1/2 translate-y-1/2", crossesClassName)} />
            {children}
        </div>
    )
}


export const BracketsWindowStyling: React.FC<WindowStylingProps & { bracketsClassName?: string, show?: boolean } & HTMLMotionProps<"div">> = ({
    className, style, children, isDetached = false, detachedClassName, detachedStyling, bracketsClassName, show = true, ...rest
}) => {
    if(show === false) return null
    
    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'relative px-2 pt-1 flex flex-col gap-2 border border-white/20 h-fit',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                ...style,
            }}
            initial="hidden"
            {...rest}
        >
            {isDetached && <DotPattern />}
            <div className={`absolute -top-1 -left-1 w-3 h-3 border-white border-l border-t`} />
            <div className={`absolute -top-1 -right-1 w-3 h-3 border-white border-r border-t`} />
            <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-white border-l border-b`} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-white border-r border-b`} />
            {children}
        </div>
    )
}



export const StandardWindowStyling = (props: WindowStylingProps) => {
    const { children, className, isDetached, style, detachedStyling, detachedClassName, ...rest } = props

    return (
        <div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'p-2 backdrop-blur-md bg-background  border-border-background border-[1px] rounded-2xl flex flex-col gap-2',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.6), 0 1px 6px -4px rgb(0 0 0 / 0.6", ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    )
}




export const CrossIcon = ({ className, ...rest }: any) => {
    return (
        <div
            className={className}
            {...rest}
        >
            <div className="absolute w-full border-t !border-white top-1/2 left-0 -translate-y-1/2" />
            <div className="absolute h-full border-l !border-white left-1/2 top-0 -translate-x-1/2" />
        </div>
    );
};
