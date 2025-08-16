import React, { memo, useCallback, useMemo } from 'react'
import { InternalTreeBranch, DummyTreeBranch, TreeComponentProps, InternalTree, BranchComponentProps } from './types'
import { getTreeStore, TreeProvider, useBranch, useTree } from './context'
import { processDummyTree } from './utils'
import { TreeCollapseButton } from '../Tree/Elements'
import BranchComponent from './branch'

const Tree: React.FC<TreeComponentProps> = ({
    src,
    className,
    renderBranch,
    loadBranchChildren
}) => {
    const { processedTree, branchFlatMap } = useMemo(() => processDummyTree(src), [src])

    const firstRootLayer = Object.values(processedTree)

    return (
        <TreeProvider processedTree={processedTree} branchFlatMap={branchFlatMap}>
            <ul role='tree'
                className={`${className} w-full`}
            >
                {firstRootLayer.map((branch, i) =>
                    <BranchComponent
                        key={branch.currentPath}
                        siblingsLen={firstRootLayer.length}
                        indexToParent={i}
                        level={0}
                        renderBranch={renderBranch}
                        loadBranchChildren={loadBranchChildren}
                        path={branch.currentPath}
                    />
                )}
            </ul>
        </TreeProvider>
    )
}

export default Tree

