import React, { useEffect, useRef } from 'react'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import StepperVerticalMap, { StepperVerticalMapHandles } from '@zeruel/shared-ui/StepperVerticalMap'
import { useWorkflowStatus } from '../stores/useWorkflowStatus'


const StepperPanel = () => {
    const steps = useWorkflowStatus(state => state.steps);
    const stepperRef = useRef<StepperVerticalMapHandles>(null)


    useEffect(() => {
      if(stepperRef.current)
        stepperRef.current.scrollToBottom();
      // let lastActiveStep;
      // const stepsArray = Array.from(steps.values());
      // const size = stepsArray.length
      // for(let i = size - 1; i >= 0; i--){
      //   if(stepsArray[i].status === "active"){
      //     stepperRef?.current?.scrollToStep(stepsArray[i].status)
      //     break;
      //   }
      // }

    }, [steps])


    return (
        <BracketsWindowStyling className='mr-auto w-full relative py-0'>
            <StepperVerticalMap ref={stepperRef} steps={steps} maxHeight='max-h-[250px]' />
        </BracketsWindowStyling>
    )
}

export default StepperPanel