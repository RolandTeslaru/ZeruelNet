import React, { useState } from 'react'
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';
import RotatingText from '@zeruel/shared-ui/RotatingText';
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import { useWorkflowStatus } from "@/stores/useWorkflowStatus"
import { useSystem } from '@/stores/useSystem';

const StagePanel = () => {
    const currentPage = useSystem(state => state.currentPage)
    const stage = useWorkflowStatus(state => state.pageStages[currentPage]);
  
    return (
      <div className='fixed flex flex-col gap-4 left-7 top-4 w-fit transition-all'>
        <div className='absolute -bottom-5'>
          <p className='text-neutral-200/10 text-xs font-mono'>SYS. STATUS PANEL</p>
        </div>
        <BracketsWindowStyling className='mr-auto relative'>
          <RotatingText
            data={stage}
            mainClassName="text-2xl px-3 py-1 font-nippo font-light tracking-wider "
            staggerFrom={"first"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            rotationInterval={7000}
          />
        </BracketsWindowStyling>
      </div>
    )
  }
  
export default StagePanel