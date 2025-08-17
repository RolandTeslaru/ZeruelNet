import React, { memo, useEffect, useRef } from 'react'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import StepperVerticalMap, { StepperVerticalMapHandles } from '@zeruel/shared-ui/StepperVerticalMap'
import { useWorkflowStatus } from '@/stores/useWorkflowStatus';


const StepperPanel = memo(() => {
    const steps = useWorkflowStatus(state => state.pageSteps["scraper"]);
    const stepperRef = useRef<StepperVerticalMapHandles>(null)

    useEffect(() => {
      if(stepperRef.current)
        stepperRef.current.scrollToBottom();
    }, [steps])

    return <StepperVerticalMap ref={stepperRef} steps={steps} maxHeight='max-h-[250px]' />
})

export default StepperPanel