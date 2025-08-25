import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import React from 'react'
import MissionPanel from './_components/MissionPanel'
import CommandPanel from './_components/CommandPanel'
import StepperPanel from './_components/StepperPanel'

const Scraper = React.memo(({ show }: { show: boolean }) => {
  return (
    <div id='ZN-DataScraper' className='absolute gap-8 top-0 left-0 flex flex-row justify-between size-full w-full h-full'>
      <VXWindow
        vxWindowId='ZN-DataScraper-StepperPanel'
        title='ZeruelNet DataHarvester: StepPanel'
        windowClasses='width=310,height=702,left=200,top=200,resizable=0'
        showControls={false}
        StylingComponent={<BracketsWindowStyling
          show={show}
          className='opacity-0 min-w-[350px] flex-col'
          contentClassName='!py-0 px-1'
          detachedClassName=''
        />}
      >
        <StepperPanel/>
      </VXWindow>


      {/* Main Panel */}
      <VXWindow
        vxWindowId='ZN-DataScraper-MissionPanel'
        title='ZereulNet DataScraper: Scraping Panel'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
          show={show}
          className='opacity-0  min-h-full max-h-full w-full flex-col'
          contentClassName='!p-0'
          detachedClassName=''
        />}
      >
        <MissionPanel />
      </VXWindow>

      <VXWindow
        vxWindowId='ZN-DataScraper-CommandPanel'
        title='ZeruelNet DataHarvester: RightPanel'
        windowClasses='width=310,height=702,left=200,top=200,resizable=0'
        StylingComponent={<BracketsWindowStyling
          show={show}
          className='opacity-0 min-w-[250px] min-h-1/2 flex-col'
          detachedClassName=''
        />}
      >
        <CommandPanel />
      </VXWindow>



      {/* <VXWindow
        vxWindowId='ZNDataHarvesterLogPanel'
        title='ZeruelNet DataHarvester: LogPanel'
        windowClasses='width=310,height=702,left=200,top=200,resizable=0'
        noStyling={true}
        showControls={false}
      >
        <div className='fixed left-1 bottom-1 p-2 rounded-xl bg-black/10 '>
          <WindowControlDots />
          <LogPanel />
        </div>
      </VXWindow> */}
    </div>
  )
})

export default Scraper