import VideosTable from '@/components/VideosTable'
import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { WindowStylingProps } from '@zeruel/shared-ui/VXWindow/useWindowContext';
import { HTMLMotionProps, Variants } from 'framer-motion';
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import React from 'react';

const animationVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      transitionEnd: {
        display: 'none',
      },
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
        delay: 0.3,
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

const Trends = React.memo(({ show }: { show: boolean }) => {

  return (
    <>
      <VXWindow
        vxWindowId='ZNDashboardVideosPanel'
        title='ZereulNet DataHarvester: Scraped Videos Panel'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
            className='!relative w-[500px] max-h-[700px] p-1 flex flex-col'
            detachedClassName=''
            variants={animationVariants}
            initial="hidden"
            animate={show ? 'visible' : 'hidden'}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
         />}
      >
        <VideosTable />
      </VXWindow>
    </>
  )
})

export default Trends;