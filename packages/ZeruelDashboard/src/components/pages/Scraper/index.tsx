import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import React from 'react'
import MissionPanel from './_components/MissionPanel'
import CommandPanel from './_components/CommandPanel'
import StepperPanel from './_components/StepperPanel'
import { LogPanel } from './_components/LogPanel'

const Scraper = React.memo(({ show }: { show: boolean }) => {
  return (
    <div id='ZN-DataScraper' className='absolute gap-8 top-0 left-0 flex flex-row justify-between size-full w-full h-full'>
      <div className='flex flex-col gap-8 h-full w-[600px] justify-between'>
        <VXWindow
          vxWindowId='ZN-DataScraper-StepperPanel'
          title='ZeruelNet DataHarvester: StepPanel'
          windowClasses='width=310,height=702,left=200,top=200,resizable=0'
          showControls={false}
          StylingComponent={<BracketsWindowStyling
            show={show}
            className='opacity-0 flex-col'
            contentClassName="!py-0 px-2"
            detachedClassName=''
          />}
        >
          <StepperPanel />
        </VXWindow>

        <VXWindow
          vxWindowId='ZN-DataScraper-LogPanel'
          title='ZeruelNet DataScraper: LogPanel'
          windowClasses='width=310,height=702,left=200,top=200,resizable=0'
          StylingComponent={<BracketsWindowStyling
            show={show}
            className=' opacity-0 min-h-1/2 flex-col'
            detachedClassName=''
            contentClassName='!px-0'
          />}
        >
          <LogPanel />
        </VXWindow>
      </div>


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
    </div>
  )
})

export default Scraper