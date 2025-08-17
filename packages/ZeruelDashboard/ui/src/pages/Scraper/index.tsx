import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import React from 'react'
import MissionPanel from './_components/MissionPanel'
import CommandPanel from './_components/CommandPanel'
import { WindowControlDots } from '@zeruel/shared-ui/VXWindow/WindowControlDots'
import { LogPanel } from './_components/LogPanel'
import StepperPanel from './_components/StepperPanel'

const Scraper = React.memo(({ show }: { show: boolean }) => {
  return (
    <div className='absolute top-0 left-0 flex flex-row justify-between size-full w-full h-full'>
      <VXWindow
        vxWindowId='ZNDataScraperLeftPanel'
        title='ZeruelNet DataHarvester: StepPanel'
        windowClasses='width=310,height=702,left=200,top=200,resizable=0'
        showControls={false}
        StylingComponent={<BracketsWindowStyling
          className='  min-w-[250px]  px-1 py-0 flex flex-col'
          detachedClassName=''
          show={show}
        />}
      >
        <StepperPanel/>
      </VXWindow>


      {/* Main Panel */}
      <VXWindow
        vxWindowId='ZNDataScraperScrapingPanel'
        title='ZereulNet DataScraper: Scraping Panel'
        windowClasses=''
        StylingComponent={<BracketsWindowStyling
          className='  min-h-full max-h-full  max-w-[calc(100%-580px)] min-w-[calc(100%-580px)] p-1 flex flex-col'
          detachedClassName=''
          show={show}
        />}
      >
        <MissionPanel />
      </VXWindow>

      <VXWindow
        vxWindowId='ZNDataScraperLeftPanel'
        title='ZeruelNet DataHarvester: RightPanel'
        windowClasses='width=310,height=702,left=200,top=200,resizable=0'
        StylingComponent={<BracketsWindowStyling
          className='  min-w-[250px] min-h-1/2 p-1 flex flex-col'
          detachedClassName=''
          show={show}
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