import React, { memo, useCallback, useImperativeHandle, useMemo, useRef } from 'react'
import { InternalTreeBranch, DummyTreeBranch, TreeComponentProps, InternalTree, BranchComponentProps, TreeProviderRef } from './types'
import { getTreeStore, TreeProvider, useBranch, useTree } from './context'
import { createInternalTree } from './utils'
import BranchComponent from './branch'
import { Button, Popover, PopoverContent, PopoverItem, PopoverTrigger } from '../foundations'
import DataViewerWrapper from '../DataViewerWrapper'

const Tree: React.FC<TreeComponentProps> = memo(({
    src,
    className,
    renderBranch,
    loadBranchChildren,
    ref
}) => {
    const { processedTree, branchFlatMap } = useMemo(() => createInternalTree(src), [src])

    const firstRootLayer = Object.values(processedTree)

    const treeProviderRef = useRef(null) as TreeProviderRef
    useImperativeHandle(ref, () => ({
        store: treeProviderRef.current.store
    }), [])

    return (
        <TreeProvider ref={treeProviderRef} processedTree={processedTree} branchFlatMap={branchFlatMap}>
            {/* <TreeContextViewerPopover/> */}
            <ul role='tree'
                className={`${className} w-full`}
            >
                {firstRootLayer.map((branch, i) =>
                    branch.isMounted 
                        ?   <BranchComponent
                                key={branch.currentPath}
                                siblingsLen={firstRootLayer.length}
                                indexToParent={i}
                                level={0}
                                renderBranch={renderBranch}
                                loadBranchChildren={loadBranchChildren}
                                path={branch.currentPath}
                            />
                        : null
                )}
            </ul>
        </TreeProvider>
    )
})

export default Tree


const TreeContextViewerPopover = () => {
    const state = useTree(state => state)

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant='accent' size='sm' className='font-roboto-mono'>
                    Show Tree Context
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <DataViewerWrapper src={state} title="Tree Context State"/>
            </PopoverContent>
        </Popover>
    )
}

