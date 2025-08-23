import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { WindowStylingProps } from '@zeruel/shared-ui/VXWindow/useWindowContext';
import { HTMLMotionProps, Variants } from 'framer-motion';
import { BracketsWindowStyling, CrossesWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import React from 'react';



const Trends = React.memo(({ show }: { show: boolean }) => {

  return (
    <div id="ZN-Trends" className='hidden absolute top-0 left-0 justify-between size-full w-full h-full grid-cols-5 grid-rows-3 gap-7'>
      <VXWindow
        vxWindowId='ZN-Trends-LeftPanel'
        title='ZeruelNet Trends'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
          className='hidden row-span-3 h-full p-1 flex-col'
          detachedClassName=''
          show={show}
        />}
      >
        <p>Timeline</p>
      </VXWindow>

      <VXWindow
        vxWindowId='ZN-Trends-Main'
        title='ZeruelNet Trends: Main'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
          className='hidden col-span-3 row-span-2 w-full h-full mt-auto p-1 flex-col'
          detachedClassName=''
          show={show}
        />}
      >
        <p>Timeline</p>
      </VXWindow>

      <VXWindow
        vxWindowId='ZN-Trends-Timeline'
        title='ZeruelNet Trends: Timeline'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
          className='hidden col-span-4 col-start-2 row-start-3 w-full h-full p-1 flex-col'
          detachedClassName=''
          show={show}
        />}
      >
        <div className='absolute top-1 left-2'>
          <p className='font-roboto-mono text-white/30'>Timeline</p>
        </div>
      </VXWindow>



      <VXWindow
        vxWindowId='ZN-Trends-Right'
        title='ZeruelNet Trends: Right'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
          className='hidden row-span-2 col-start-5 row-start-1  w-full h-full  mt-auto p-1 flex-col'
          detachedClassName=''
          show={show}
        />}
      >
        <p>Timeline</p>
      </VXWindow>

    </div>
  )
})

export default Trends;