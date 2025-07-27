import { useHarvesterStore } from './stores/useHarvesterStore';
import Layout from './components/Layout';
import { BracketsWindowStyling, CrossesWindowStyling, StandardWindowStyling, VXWindow } from './ui/components/VXWindow';
import { LogPanel } from './ui/components/LogPanel';
import { WindowControlDots } from './ui/components/VXWindow/WindowControlDots';

import StagePanel from './components/StagePanel';
import ScrapingDashboardPanel from './components/ScrapingDashboardPanel';
import CommandPanel from './components/CommandPanel';
import StepperPanel from './components/StepperPanel';

useHarvesterStore.getState().connect()

function App() {
  return (
    <Layout>
      <div className="flex flex-row gap-4 min-w-auto min-h-screen w-full px-6 pb-6 pt-[150px]">
        {/* <Watermark /> */}
        {/* Left Panel */}
        <div className='min-w-60 h-auto'>
          <StepperPanel />
        </div>
        {/* Main Panel */}
        <div className='w-full h-auto'>
          <VXWindow
            vxWindowId='ZNDataHarvesterScrapingPanel'
            title='ZereulNet DataHarvester: Scraping Panel'
            windowClasses=''
            StylingComponent={
              <BracketsWindowStyling
                className='!relative h-full !p-0'
                detachedClassName=''
              />
            }
          >
            <ScrapingDashboardPanel />
          </VXWindow>
        </div>

        {/* Right Panel */}
        <div className='w-60 h-auto'>
          <VXWindow
            vxWindowId='ZNDataHarvesterLeftPanel'
            title='ZeruelNet DataHarvester: RightPanel'
            windowClasses='width=310,height=702,left=200,top=200,resizable=0'
            StylingComponent={
              <StandardWindowStyling
                className="w-60 h-[350px] pt-3"
                detachedClassName="!top-0 !left-0 !w-[calc(100%_-_60px)] h-full"
              />
            }
          >
            <CommandPanel />
          </VXWindow>

        </div>

        <StagePanel />

        {/* <div className='w-full h-full bg-green-400/80'>
          <InformationPanel />
        </div> */}





        <VXWindow
          vxWindowId='ZNDataHarvesterLogPanel'
          title='ZeruelNet DataHarvester: LogPanel'
          windowClasses='width=310,height=702,left=200,top=200,resizable=0'
          noStyling={true}
          showControls={false}
        >
          <div className='fixed left-1 bottom-1 w-[500px] h-[120px] p-2 rounded-xl bg-black/5 '>
            <WindowControlDots />
            <LogPanel />
          </div>
        </VXWindow>
      </div>
    </Layout>
  )
}

export default App

const InformationPanel = () => {
  return (
    <div className='fixed left-[550px] top-6 text-white text-xs font-roboto-mono'>
      <h1>ZereulNet Data Harvester Module</h1>
    </div>
  )
}