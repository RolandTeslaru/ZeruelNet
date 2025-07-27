import React, { useRef, useState } from 'react'
import { Check, Circle, Minus } from '../icons';


interface StepProps {
    id: string;
    label: string
    description: string;
    status: "completed" | "active" | "inactive"
    timestamp?: string
}

interface StepperVerticalMapProps {
    initialSteps?: StepProps[]
    className?: string
    maxHeight?: string
}

const StepperVerticalMap: React.FC<StepperVerticalMapProps> = ({
    initialSteps = [],
    className = "!w-full",
    maxHeight = "max-h-[300px]",
}) => {
    const [steps, setSteps] = useState<StepProps[]>(initialSteps);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)

    return (
        <div className='relative'>
            <div
                ref={scrollContainerRef}
                className={`${maxHeight} !w-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 ${
                    steps.length > 2 ? "[mask-image:linear-gradient(to_bottom,transparent,black_28px)]" : ""
                }`}
            >
                <div className='space-y-1'>
                    {steps.length === 0 ? (
                        <div className="text-center text-white/40 font-mono text-sm">
                            NO_PROCESSES_ACTIVE
                        </div>
                    ) : (
                        steps.map((step, index) => <Step {...step} index={index} mapLength={steps.length} />)
                    )}
                </div>
            </div>
        </div>
    )
}

export default StepperVerticalMap

const Step: React.FC<StepProps & { index: number, mapLength }> = (props) => {
    return (
        <div
            id={props.id}
            className={`relative flex items-start transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in`}
        >
            {props.index < props.mapLength - 1 && (
                <div className="absolute left-2 top-6 w-0.5 h-5 bg-white/20 transition-all duration-300" />
            )}


            {/* Step Circle */}
            <div className="relative z-10 flex-shrink-0">
                <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${props.status === "completed"
                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                        : props.status === "active"
                            ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20 animate-pulse"
                            : "bg-black border-white/40 text-white/60"
                        }`}
                >
                    {props.status === "completed" && <Check className="w-4 h-4" />}
                    {props.status === "active" && <Circle className="w-2 h-2 fill-current" />}
                    {props.status === "inactive" && <Minus className="w-4 h-4" />}
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