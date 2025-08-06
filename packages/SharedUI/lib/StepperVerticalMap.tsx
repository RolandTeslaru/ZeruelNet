import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Check, Circle, Minus, X } from './icons';
import { SystemStep } from '@zeruel/scraper-types';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'motion/react';

interface StepperVerticalMapProps {
    steps?: Map<string, SystemStep>
    className?: string
    maxHeight?: string
}

export interface StepperVerticalMapHandles {
    scrollToBottom: () => void;
    scrollToStep: (stepId: string) => void;
}

const StepperVerticalMap = forwardRef<StepperVerticalMapHandles, StepperVerticalMapProps>(({
    steps = new Map(),
    className = "!w-full",
    maxHeight = "max-h-[300px]",
}, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)

    useImperativeHandle(ref, () => ({
        scrollToBottom: () => {
            if(scrollContainerRef.current){
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
            }
        },
        scrollToStep: (stepId: string) => {
            if (scrollContainerRef.current) {
                const stepElement = scrollContainerRef.current.querySelector(`#step--${stepId}`);
                if (stepElement) {
                    stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }
    }))


    return (
        <div className='relative'>
            <div
                ref={scrollContainerRef}
                className={`${maxHeight} scroll-smooth !w-full gap-1 pt-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20" `}
            >
                {steps.size === 0 ? (
                    <div className="text-center text-white/40 font-mono text-sm">
                        NO_PROCESSES_ACTIVE
                    </div>
                ) : (
                    <AnimatePresence>
                        {Array.from(steps).map(([stepId, step], index) =>
                            <motion.div
                                key={stepId}
                                initial={{ opacity: 0, x: -200 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ ease: 'linear', duration: 0.5 }}
                            >
                                <Step {...step} index={index} mapLength={step.size} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
})

export default StepperVerticalMap

const Step: React.FC<SystemStep & { index: number, mapLength }> = (props) => {
    return (
        <div
            className={`relative flex items-start transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in`}
        >
            {props.index < props.mapLength - 1 && (
                <div className="absolute left-2 top-6 w-0.5 h-5 bg-white/20 transition-all duration-300" />
            )}


            {/* Step Circle */}
            <div className="relative z-10 flex-shrink-0">
                <div
                    className={classNames(
                        `w-4 h-4 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300`,
                        { "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20": props.status === "completed" },
                        { "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 animate-pulse": props.status === "active" },
                        { "bg-black border-white/40 text-white/60": props.status === "pending" }
                    )}
                >
                    {props.status === "completed" && <Check className="w-4 h-4" />}
                    {props.status === "active" && <Circle className="w-2 h-2 fill-current" />}
                    {props.status === "pending" && <Minus className="w-4 h-4" />}
                    {props.status === "failed" && <X className="w-4 h-4" />}
                </div>
            </div>

            {/* Step Content */}

            <div className="ml-2 pb-2 flex-1">
                <div
                    className={`font-roboto-mono text-xs font-medium mb-1 transition-all duration-300 ${props.status === "completed" || props.status === "active" ? "text-white" : "text-white/60"
                        }`}
                >
                    {props.label}
                </div>
                {props.description && (
                    <div
                        className={`font-roboto-mono text-xs font-light mb-2 transition-all duration-300 ${props.status === "completed" || props.status === "active" ? "text-white/80" : "text-white/40"
                            }`}
                    >
                        {props.description}
                    </div>
                )}

                {/* Status and Timestamp */}

            </div>
        </div>
    )
}