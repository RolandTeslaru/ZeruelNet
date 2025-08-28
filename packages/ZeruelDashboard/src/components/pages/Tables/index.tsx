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
            <div id="ZN-Tables" className='absolute top-0 left-0 hidden flex-row justify-between size-full w-full h-full'>
                <VXWindow
                    vxWindowId='ZN-Dashboard-Database-Tree-Panel'
                    title='ZeruelNet Dashboard: Table Info Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className='hidden min-w-[250px] max-w-[250px] h-full flex-col'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DatabaseTreePanel />
                </VXWindow>
                <VXWindow
                    vxWindowId='ZN-Dashboard-Database-Table-Viewer'
                    title='ZereulNet Dashboard: Table Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className='hidden bg-neutral-950/30 h-full max-w-[calc(100%-580px)] min-w-[calc(100%-580px)] flex-col'
                        contentClassName='!px-0'
                        detachedClassName=''
                        show={show}
                    />}
                >
                    <DatabaseTableViewer />
                </VXWindow>
                <VXWindow
                    vxWindowId='ZN-Dashboard-Database-Query-Panel'
                    title='ZeruelNet Dashboard: Table Query Window'
                    windowClasses=''
                    StylingComponent={<BracketsWindowStyling
                        className=' hidden min-w-[250px] h-full flex-col'
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