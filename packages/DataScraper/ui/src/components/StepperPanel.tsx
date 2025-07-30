import React from 'react'
import { BracketsWindowStyling } from '../ui/components/VXWindow'
import StepperVerticalMap from '../ui/components/StepperVerticalMap'
import { useSystemStatus } from '../stores/useSystemStatus'

const steps = [
    {
      id: "init",
      label: "SYSTEM_INITIALIZATION",
      description: "Preparing deployment environment",
      status: "completed" as const,
    },
    {
      id: "config",
      label: "CONFIGURATION_SETUP",
      description: "Loading system parameters",
      status: "completed" as const,
    },
    {
      id: "config",
      label: "CONFIGURATION_SETUP",
      description: "Loading system parameters",
      status: "completed" as const,
    },
    {
      id: "config",
      label: "CONFIGURATION_SETUP",
      description: "Loading system parameters",
      status: "completed" as const,
    },
    {
      id: "deploy",
      label: "DEPLOYMENT_PROCESS",
      description: "Executing deployment sequence",
      status: "active" as const,
    }
  ]

const StepperPanel = () => {
    const steps = useSystemStatus(state => state.steps);
    return (
        <BracketsWindowStyling className='mr-auto w-full relative py-0'>
            <StepperVerticalMap steps={steps} maxHeight='max-h-[300px]' />
        </BracketsWindowStyling>
    )
}

export default StepperPanel