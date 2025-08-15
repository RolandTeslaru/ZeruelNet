import { VXWindow } from '@zeruel/shared-ui/VXWindow'
import { BracketsWindowStyling } from '@zeruel/shared-ui/WindowStyling';
import React from 'react'
import { TablesProvider } from './context';
import DatabaseTableViewer from './_components/DatabaseTableViewer';
import DatabaseQueryPanel from './_components/DatabaseQueryPanel';
import DatabaseTreePanel from './_components/DatabaseTreePanel';

const Tables = React.memo(({ show }: { show: boolean }) => {
    return (
        <TablesProvider>
            <div className='flex flex-row justify-between size-full w-full h-full'>
                <VXWindow
                    vxWindowId='ZNDashboardTableInfoWindow'
                    title='ZeruelNet Dashboard: Table Info Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className='   min-w-[250px] max-w-[250px] h-full p-1 flex flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DatabaseTreePanel />
                </VXWindow>
                <VXWindow
                    vxWindowId='ZNDashboardTabelWindow'
                    title='ZereulNet Dashboard: Table Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className=' bg-neutral-950/30 min-h-full max-h-full  max-w-[calc(100%-580px)] min-w-[calc(100%-580px)] p-1 flex flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DatabaseTableViewer />
                </VXWindow>
                <VXWindow
                    vxWindowId='ZNDashboardTableQueryWindow'
                    title='ZeruelNet Dashboard: Table Query Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className='  min-w-[250px]  h-full p-1 flex flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DatabaseQueryPanel />
                </VXWindow>
            </div>
        </TablesProvider>
    )
})

export default Tables