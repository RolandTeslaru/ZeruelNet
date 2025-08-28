import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import React from 'react'
import { EnrichmentViewerProvider } from './context'
import EnrichmentDataTable from './_components/EnrichmentDataTable'
import VideoFeaturesViewer from "./_components/VideoFeaturesViewer"


const Enrichment = React.memo(({ show }: { show: boolean }) => {
    return (
        <EnrichmentViewerProvider>
            <div id='ZN-Enrichment' className='absolute gap-8 top-0 left-0 flex flex-row justify-between size-full w-full h-full'>

                {/* Main Panel */}
                <VXWindow
                    vxWindowId='ZN-Enrichment-TablePanel'
                    title='ZereulNet Enrichment: Table Panel'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        show={show}
                        className='hidden h-full max-h-full w-[calc(50%_-_16px)] flex-col'
                        contentClassName='h-full !px-0 '
                        detachedClassName=''
                    />}
                >
                    <EnrichmentDataTable/>
                </VXWindow>
                <VXWindow
                    vxWindowId='ZN-Enrichment-DataPanel'
                    title='ZereulNet Enrichment: Data Panel'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        show={show}
                        className='hidden  w-[calc(50%_-_16px)] min-h-full max-h-full !p-0 flex-col'
                        detachedClassName=''
                    />}
                >
                    <VideoFeaturesViewer/>
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

        </EnrichmentViewerProvider>
    )
})

export default Enrichment