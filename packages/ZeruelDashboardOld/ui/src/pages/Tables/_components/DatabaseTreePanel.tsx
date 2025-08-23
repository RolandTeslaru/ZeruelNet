import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import Tree from '@zeruel/shared-ui/Tree'
import { Database, Info, Table } from '@zeruel/shared-ui/icons'
import { fetchTableColumns, fetchTableConstraints, fetchTableIndexes, fetchTableTriggers } from '@/lib/api/dashboard'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, Popover, PopoverContent, PopoverItem, PopoverTrigger } from '@zeruel/shared-ui/foundations'
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { memo } from 'react'
import { DummyTree, InternalTreeBranch, LoadBranchChildrenFunction, RenderBranchFunction } from '@zeruel/shared-ui/Tree/types'
import { TreeStore } from '@zeruel/shared-ui/Tree/context'

const ZeruelTablesTree: DummyTree = {
    "zeruel_net": {
        isExpanded: true,
        children: {
            "videos": {
                isExpanded: true,
                children: {
                    "columns": { data: { tableName: "videos" } },
                    "constraints": { data: { tableName: "videos" } },
                    "indexes": { data: { tableName: "videos" } },
                    "triggers": { data: { tableName: "videos" } },
                }
            },
            "video_features": {
                isExpanded: true,
                children: {
                    "columns": { data: { tableName: "video_features" } },
                    "constraints": { data: { tableName: "video_features" } },
                    "indexes": { data: { tableName: "video_features" } },
                    "triggers": { data: { tableName: "video_features" } }
                }
            },
            "comments": {
                isExpanded: true,
                children: {
                    "columns": { data: { tableName: "comments" } },
                    "constraints": { data: { tableName: "comments" } },
                    "indexes": { data: { tableName: "comments" } },
                    "triggers": { data: { tableName: "comments" } },
                }
            }
        }
    }
}

const ICON_MAP = {
    "videos": <svg className='h-4 w-4 stroke-blue-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" /></svg>,
    "video_features": <svg className='h-4 w-4 stroke-blue-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" /></svg>,
    "comments": <svg className='h-4 w-4 stroke-blue-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" /></svg>,
    "zeruel_net": <Database className='h-4 w-4 stroke-orange-300' />,
    "constraints": <div className='flex !text-red-400 relative w-4 h-4 '>
        <svg className='absolute -left-1' width="16" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 11L6 4L10.5 7.5L6 11Z" fill="currentColor"></path></svg>
        <svg className='absolute -right-1' width="16" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 4L9 11L4.5 7.5L9 4Z" fill="currentColor"></path></svg>
    </div>,
    "columns": <svg className='w-4 h-4 text-green-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 3v18" /></svg>,
    "indexes": <svg className='w-4 h-4 text-cyan-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12H3" /><path d="M16 18H3" /><path d="M16 6H3" /><path d="M21 12h.01" /><path d="M21 18h.01" /><path d="M21 6h.01" /></svg>,
    "triggers": <svg className='w-4 h-4 text-sky-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 10a7.31 7.31 0 0 0 10 10Z" /><path d="m9 15 3-3" /><path d="M17 13a6 6 0 0 0-6-6" /><path d="M21 13A10 10 0 0 0 11 3" /></svg>
}


const renderBranchContent: RenderBranchFunction = (branch, BranchTemplate) => {
    const fetchedDataType = branch.data?.fetchedDataType;
    return (
        <BranchTemplate className='h-[30px] min-w-fit'>
            <div className='flex flex-row gap-1 min-w-full relative'>
                <div>
                    {ICON_MAP[branch.key]}
                </div>
                <p className='w-fit'>
                    {branch.key}
                </p>
                {Object.keys(NAME_KEY_MAP).includes(fetchedDataType) &&
                    <div className='absolute right-0 -mt-1'>
                        <Popover>
                            <PopoverTrigger className='ml-auto cursor-pointer'>
                                <Info className='w-[16px]' />
                            </PopoverTrigger>
                            <PopoverContent side="right" align="start">
                                <DataViewerWrapper src={branch.data?.item} title="Data" />
                            </PopoverContent>
                        </Popover>

                    </div>
                }
            </div>
        </BranchTemplate>
    )
}

const NAME_KEY_MAP: Record<string, string> = {
    "columns": "column_name",
    "indexes": "index_name",
    "triggers": "trigger_name",
    "constraints": "constraint_name",
};


const loadBranchChildren: LoadBranchChildrenFunction = async (parentBranch, state: TreeStore) => {
    const tableName = parentBranch.data?.tableName;
    if (!tableName) return new Map();

    const parentKey = parentBranch.key; // columns | indexes | triggers | constraints
    const fetcher = FETCHER_MAP[parentKey];
    const nameKey = NAME_KEY_MAP[parentKey];

    if (!fetcher || !nameKey) return new Map();

    const fetchedData = (await fetcher(tableName)) as any[];
    const children: Map<string, InternalTreeBranch> = new Map();

    fetchedData.forEach(item => {
        const key = item[nameKey];
        if (!key) return;

        const currentPath = `${parentBranch.currentPath}.${key}`;
        children.set(key, {
            key,
            currentPath,
            children: new Map(), // These are leaf nodes
            isExpanded: false,
            canBeExpanded: false,
            parentPaths: new Set([parentBranch.currentPath]),
            data: {
                item,
                "fetchedDataType": parentKey
            },
            isLoading: false
        });
    });

    return children;
};

const FETCHER_MAP: Record<string, any> = {
    "columns": fetchTableColumns,
    "indexes": fetchTableIndexes,
    "triggers": fetchTableTriggers,
    "constraints": fetchTableConstraints,
}

const DatabaseTreePanel = memo(() => {

    return (
        <CollapsiblePanel
            title="Database Tree"
            className='max-w-full'
            contentClassName='overflow-scroll !max-w-full'
        >
            <Tree
                src={ZeruelTablesTree}
                // defaultExpandedKeys={DEFAULT_EXPANDED_KEYS}
                renderBranch={renderBranchContent}
                loadBranchChildren={loadBranchChildren}
            // createNodeDataFn={createNodeDataFn}
            />
        </CollapsiblePanel>
    )
})

export default DatabaseTreePanel