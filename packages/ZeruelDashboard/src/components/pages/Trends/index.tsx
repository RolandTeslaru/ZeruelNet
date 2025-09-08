import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling, CrossesWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import React, { memo } from 'react';
import { TrendsProvider } from './context';
import StateVisualization from './_components/StateVisualization';
import SubjectAlignmentChart from './_components/SubjectAlignmentChart';
import TimelineComposedChart from './_components/TimelineComposedChart';
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel';
import DatabaseTreePanel from '../Tables/_components/DatabaseTreePanel';
import HorizontalCollapsiblePanel from "@zeruel/shared-ui/HorizontalCollapsiblePannel"
import TimelineQueryPanel from './_components/TimelineQueryPanel';
import JsonDataView from './_components/JsonDataView';


const Trends = React.memo(({ show }: { show: boolean }) => {
  return (
    <TrendsProvider>
      <div id="ZN-Trends" className='hidden absolute top-0 left-0 justify-between size-full w-full h-full grid-cols-5 grid-rows-3 gap-7'>
        <VXWindow
          vxWindowId='ZN-Trends-LeftPanel'
          title='ZeruelNet Trends'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden row-span-3 h-full flex-col'
            contentClassName=''
            detachedClassName=''
            show={show}
          />}
        >
          <DatabaseTreePanel />
        </VXWindow>

        <VXWindow
          vxWindowId='ZN-Trends-Main'
          title='ZeruelNet Trends: Main'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden col-span-3 row-span-2 w-full h-full mt-auto flex-col'
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
            className='hidden col-span-4 col-start-2 row-start-3 w-full h-full'
            contentClassName=''
            detachedClassName=''
            show={show}
          />}
        >
          <div className='size-full relative flex flex-row gap-4'>
            <HorizontalCollapsiblePanel 
              title='VOLUME ALIGNMENT'
              contentClassName='pp-0'
              openWidth={"100%"}
              closedWidth={"40"}
              defaultOpen={true}
            >
              <TimelineComposedChart/>
            </HorizontalCollapsiblePanel>
            <HorizontalCollapsiblePanel 
              title='QUERY'
              contentClassName='!py-0'
              openWidth={"25%"}
              closedWidth={"40"}
              defaultOpen={true}
            >
              <TimelineQueryPanel/>
            </HorizontalCollapsiblePanel>
            <HorizontalCollapsiblePanel 
              title='JSON DATA'
              contentClassName='!py-0'
              defaultOpen={false}
              openWidth={"50%"}
              closedWidth={"40"}
            >
              <JsonDataView/>
            </HorizontalCollapsiblePanel>
          </div>
        </VXWindow>



        <VXWindow
          vxWindowId='ZN-Trends-Right'
          title='ZeruelNet Trends: Right'
          windowClasses=''
          StylingComponent={<BracketsWindowStyling
            className='hidden row-span-2 col-start-5 row-start-1  w-full h-full  mt-auto flex-col'
            contentClassName=''
            detachedClassName=''
            show={show}
          />}
        >
          <CollapsiblePanel 
            title='LLM IDENTIFIED SUBJECTS ALIGNMENT'
            className='!h-[100%]'
            contentClassName='overflow-y-scroll'
          >
            <SubjectAlignmentChart/>
          </CollapsiblePanel>
        </VXWindow>

      </div>
    </TrendsProvider>
  )
})

export default Trends;