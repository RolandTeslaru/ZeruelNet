import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import Tree from '@zeruel/shared-ui/Tree'
import { CreateNodeDataFnType, TreeNodeDataType, TreeNodeElementTemplateProps, TreeNodeType } from '@zeruel/shared-ui/Tree/types'
import { Database, Table } from '@zeruel/shared-ui/icons'
import { fetchTableColumns, fetchTableConstraints, fetchTableIndexes, fetchTableTriggers } from '@/lib/api'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, Popover, PopoverContent, PopoverTrigger } from '@zeruel/shared-ui/foundations'
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { memo } from 'react'

const ZeruelTablesTree: Record<string, TreeNodeDataType> = {
    "zeruel_net": {
        key: "zeruel_net",
        currentPath: "zeruel_net",
        refObject: null,
        children: {
            "videos": {
                key: "videos",
                currentPath: "zeruel_net.videos",
                children: {
                    "columns": {
                        key: "columns",
                        currentPath: "zeruel_net.videos.columns",
                        children: null,
                        refObject: {
                            tableName: "videos"
                        }
                    },
                    "constraints": {
                        key: "constraints", 
                        currentPath: "zeruel_net.videos.constraints",
                        children: null,
                        refObject: {
                            tableName: "videos"
                        }
                    },
                    "indexes": {
                        key: "indexes",
                        currentPath: "zeruel_net.videos.indexes", 
                        children: null,
                        refObject: null
                    },
                    "triggers": {
                        key: "triggers",
                        currentPath: "zeruel_net.videos.triggers",
                        children: null,
                        refObject: {
                            tableName: "videos"
                        }
                    }
                },
                refObject: null
            },
            "video_features": {
                key: "video_features",
                currentPath: "zeruel_net.video_features",
                children: {
                    "columns": {
                        key: "columns",
                        currentPath: "zeruel_net.video_features.columns",
                        children: null,
                        refObject: {
                            tableName: "video_features"
                        },
                    },
                    "constraints": {
                        key: "constraints",
                        currentPath: "zeruel_net.video_features.constraints", 
                        children: null,
                        refObject: {
                            tableName: "video_features"
                        }
                    },
                    "indexes": {
                        key: "indexes",
                        currentPath: "zeruel_net.video_features.indexes",
                        children: null,
                        refObject: {
                            tableName: "video_features"
                        }
                    },
                    "triggers": {
                        key: "triggers",
                        currentPath: "zeruel_net.video_features.triggers",
                        children: null,
                        refObject: {
                            tableName: "video_features"
                        }
                    }
                },
                refObject: null
            },
            "comments": {
                key: "comments", 
                currentPath: "zeruel_net.comments",
                children: {
                    "columns": {
                        key: "columns",
                        currentPath: "zeruel_net.comments.columns",
                        children: null,
                        refObject: {
                            tableName: "comments"
                        }
                    },
                    "constraints": {
                        key: "constraints",
                        currentPath: "zeruel_net.comments.constraints",
                        children: null,
                        refObject: {
                            tableName: "comments"
                        }
                    },
                    "indexes": {
                        key: "indexes",
                        currentPath: "zeruel_net.comments.indexes",
                        children: null,
                        refObject: {
                            tableName: "comments"
                        }
                    },
                    "triggers": {
                        key: "triggers",
                        currentPath: "zeruel_net.comments.triggers",
                        children: null,
                        refObject: {
                            tableName: "comments"
                        }
                    }
                },
                refObject: null
            }
        }
    }
}

const ICON_MAP = {
    "videos": <svg className='h-4 w-4 stroke-blue-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
    "video_features": <svg className='h-4 w-4 stroke-blue-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
    "comments": <svg className='h-4 w-4 stroke-blue-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
    "zeruel_net": <Database className='h-4 w-4 stroke-orange-300'/>,
    "constraints": <div className='flex !text-red-400 relative w-4 h-4 '>
        <svg className='absolute -left-1' width="16" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 11L6 4L10.5 7.5L6 11Z" fill="currentColor"></path></svg>
        <svg className='absolute -right-1' width="16" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 4L9 11L4.5 7.5L9 4Z" fill="currentColor"></path></svg>
    </div>,
    "columns": <svg className='w-4 h-4 text-green-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>,
    "indexes": <svg className='w-4 h-4 text-cyan-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12H3"/><path d="M16 18H3"/><path d="M16 6H3"/><path d="M21 12h.01"/><path d="M21 18h.01"/><path d="M21 6h.01"/></svg>,
    "triggers": <svg className='w-4 h-4 text-sky-300' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 10a7.31 7.31 0 0 0 10 10Z"/><path d="m9 15 3-3"/><path d="M17 13a6 6 0 0 0-6-6"/><path d="M21 13A10 10 0 0 0 11 3"/></svg>
}

const renderNodeContent = (node: any, NodeParams: TreeNodeElementTemplateProps) => {
    const { NodeTemplate } = NodeParams
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <NodeTemplate className='h-[30px]'>
                    <div className='flex flex-row gap-1'>
                        <div>
                            {ICON_MAP[node.key]}
                        </div>
                        <p>
                            {node.key}
                        </p>
                    </div>
                </NodeTemplate>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <DataViewerWrapper src={node} title="Node Data"/>
            </ContextMenuContent>
        </ContextMenu>
    )
}

const loadColumnsDetails: CreateNodeDataFnType = async ({ currentPath, parentNode }) => {
    if (!parentNode) return {}
    const tableName = parentNode?.refObject?.tableName
    if(!tableName) return {}
    const columns = await fetchTableColumns(tableName)
    
    const children: Record<string, TreeNodeDataType> = {}
    columns.forEach(col => {
        children[col.column_name] = {
            key: col.column_name,
            currentPath: `${currentPath}.${col.column_name}`,
            children: {},
            refObject: col
        }
    })
    return children
}

const loadIndexesDetails: CreateNodeDataFnType = async ({ currentPath, parentNode }) => {
    if (!parentNode) return {}
    const tableName = parentNode?.refObject?.tableName
    if(!tableName) return {}
    const indexes = await fetchTableIndexes(tableName)
    
    const children: Record<string, TreeNodeDataType> = {}
    indexes.forEach(idx => {
        children[idx.index_name] = {
            key: idx.index_name,
            currentPath: `${currentPath}.${idx.index_name}`,
            children: {},
            refObject: idx
        }
    })
    return children
}

const loadTriggersDetails: CreateNodeDataFnType = async ({ currentPath, parentNode }) => {
    if (!parentNode) return {}
    const tableName = parentNode?.refObject?.tableName
    if(!tableName) return {}
    const triggers = await fetchTableTriggers(tableName)
    
    const children: Record<string, TreeNodeDataType> = {}
    triggers.forEach(trg => {
        children[trg.trigger_name] = {
            key: trg.trigger_name,
            currentPath: `${currentPath}.${trg.trigger_name}`,
            children: {},
            refObject: trg
        }
    })
    return children
}

const loadConstraintsDetails: CreateNodeDataFnType = async ({ currentPath, parentNode }) => {
    if (!parentNode) return {}
    const tableName = parentNode?.refObject?.tableName
    if(!tableName) return {}
    const constraints = await fetchTableConstraints(tableName)
    
    const children: Record<string, TreeNodeDataType> = {}
    constraints.forEach(con => {
        children[con.constraint_name] = {
            key: con.constraint_name,
            currentPath: `${currentPath}.${con.constraint_name}`,
            children: {},
            refObject: con
        }
    })
    return children
}

const LOADERS_MAP: Record<string, CreateNodeDataFnType> = {
    "columns": loadColumnsDetails,
    "indexes": loadIndexesDetails,
    "triggers": loadTriggersDetails,
    "constraints": loadConstraintsDetails,
}

const DEFAULT_EXPANDED_KEYS = {
    "zeruel_net": true,
    "videos": true,
    "video_features": true,
    "comments": true,
}

const DatabaseTreePanel = memo(() => {
    const createNodeDataFn: CreateNodeDataFnType = (props) => {
        const createFn = LOADERS_MAP[props.key]
        if (createFn) {
            return createFn(props)
        }
        return {}
    }
    

    return (
        <CollapsiblePanel
            title="Database Tree"
            className='max-w-full'
            contentClassName='overflow-scroll !max-w-full'
        >
                <Tree 
                    tree={ZeruelTablesTree} 
                    defaultExpandedKeys={DEFAULT_EXPANDED_KEYS}
                    renderNodeContent={renderNodeContent}
                    createNodeDataFn={createNodeDataFn}
                />
        </CollapsiblePanel>
    )
})

export default DatabaseTreePanel