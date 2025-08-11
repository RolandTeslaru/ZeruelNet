
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
                'p-2 flex flex-col gap-2 border border-white/20',
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
            <Icon className={classNames("absolute h-4 w-4 top-0 left-0 transform -translate-x-1/2 -translate-y-1/2", crossesClassName)} />
            <Icon className={classNames("absolute h-4 w-4 top-0 right-0 transform translate-x-1/2 -translate-y-1/2", crossesClassName)} />
            <Icon className={classNames("absolute h-4 w-4 bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2", crossesClassName)} />
            <Icon className={classNames("absolute h-4 w-4 bottom-0 right-0 transform translate-x-1/2 translate-y-1/2", crossesClassName)} />
            {children}
        </div>
    )
}


const bracketsWindowVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.5,

        transition: {
            duration: 0.3,
            ease: 'easeInOut',
        }
    },
    visible: {
        opacity: 1,
        scale: 1,
        display: 'flex',
        transition: {
            delay: 0.4,
            duration: 0.3,
            ease: "easeInOut",
        },
    },
}


export const BracketsWindowStyling: React.FC<WindowStylingProps & { bracketsClassName?: string, show?: boolean } & HTMLMotionProps<"div">> = ({
    className, style, children, isDetached = false, detachedClassName, detachedStyling, bracketsClassName, show = true, ...rest
}) => {
    return (
        <motion.div
            className={classNames(
                isDetached && ['rounded-none', detachedClassName],
                'relative p-2 flex flex-col gap-2 border border-white/20 h-fit',
                className,
                { "rounded-none": isDetached },
            )}
            style={{
                ...(isDetached ? detachedStyling : {}),
                ...style,
            }}
            animate={show ? 'visible' : 'hidden'}
            initial="hidden"
            variants={bracketsWindowVariants}
            
            {...rest}
        >
            {/* <motion.span className="absolute size-full bg-white left-0 top-0 z-10"
                animate={show ? 'visible' : 'hidden'}
                variants={{
                    visible: {
                        scale:
                    }
                }}
            /> */}
            {isDetached && <DotPattern />}
            <div className={`absolute -top-1 -left-1 w-3 h-3 border-white border-l border-t`} />
            <div className={`absolute -top-1 -right-1 w-3 h-3 border-white border-r border-t`} />
            <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-white border-l border-b`} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-white border-r border-b`} />
            {children}
        </motion.div>
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




export const Icon = ({ className, ...rest }: any) => {
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
