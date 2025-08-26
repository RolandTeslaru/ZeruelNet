import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { WindowStylingProps } from '@zeruel/shared-ui/VXWindow/useWindowContext';
import { HTMLMotionProps, Variants } from 'framer-motion';
import { BracketsWindowStyling, CrossesWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import React, { memo } from 'react';
import { TrendsProvider } from './context';
import { useQuery } from '@tanstack/react-query';
import TimelineChart from './_components/TimelineChart';
import StateVisualization from './_components/StateVisualization';



const Trends = React.memo(({ show }: { show: boolean }) => {
  return (
    <TrendsProvider>
      <div id="ZN-Trends" className='hidden absolute top-0 left-0 justify-between size-full w-full h-full grid-cols-5 grid-rows-3 gap-7'>
        <VXWindow
          vxWindowId='ZN-Trends-LeftPanel'
          title='ZeruelNet Trends'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden row-span-3 h-full p-1 flex-col'
            contentClassName='!px-0 !pb-0'
            detachedClassName=''
            show={show}
          />}
        >
        </VXWindow>

        <VXWindow
          vxWindowId='ZN-Trends-Main'
          title='ZeruelNet Trends: Main'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden col-span-3 row-span-2 w-full h-full mt-auto p-1 flex-col'
            contentClassName='!px-0 !pb-0'
            detachedClassName=''
            show={show}
          />}
        >
          <StateVisualization/>
        </VXWindow>

        <VXWindow
          vxWindowId='ZN-Trends-Timeline'
          title='ZeruelNet Trends: Timeline'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden col-span-4 col-start-2 row-start-3 w-full h-full flex-col'
            contentClassName='!px-0 !pb-0'
            detachedClassName=''
            show={show}
          />}
        >
          <TimelineChart/>
        </VXWindow>



        <VXWindow
          vxWindowId='ZN-Trends-Right'
          title='ZeruelNet Trends: Right'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden row-span-2 col-start-5 row-start-1  w-full h-full  mt-auto p-1 flex-col'
            contentClassName='!px-0 !pb-0'
            detachedClassName=''
            show={show}
          />}
        >
          <p>Timeline</p>
        </VXWindow>

      </div>
    </TrendsProvider>
  )
})

export default Trends;