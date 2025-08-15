import React, { useMemo } from 'react'
import { InternalTreeBranch, DummyTreeBranch, TreeComponentProps, InternalTree } from './types'

const Tree: React.FC<TreeComponentProps> = ({ src }) => {
    const { processedTree, branchFlatMap } = useMemo(() => processDummyTree(src), [src])
    return (
        <div>index</div>
    )
}

export default Tree


const processDummyTree = (src: Record<string, DummyTreeBranch>) => {
    const root: InternalTree = {}
    const branchFlatMap: Map<string, InternalTreeBranch> = new Map()

    Object.entries(src).forEach(([_dummyBranchKey, _dummyBranch]) => {
        root[_dummyBranchKey] = processDummyBranch(_dummyBranchKey, _dummyBranch, branchFlatMap)
    })
    return { processedTree: root, branchFlatMap};
}

const processDummyBranch = (key: string, dummyBranch: DummyTreeBranch, branchFlatMap: Map<string, InternalTreeBranch>, parentInternalBranch?: InternalTreeBranch,) => {
    const needsLazyLoading = dummyBranch.children === undefined
    const childrenLength = Object.values(dummyBranch.children ?? {}).length


    const currentPath = parentInternalBranch ? `${parentInternalBranch.currentPath}.${key}` : key
    const parentBranches = new Map<string, InternalTreeBranch>();
    if (parentInternalBranch)
        parentBranches.set(parentInternalBranch.currentPath, parentInternalBranch)


    const curBranch: InternalTreeBranch = {
        key,
        currentPath,
        isExpanded: false,
        canBeExpanded: childrenLength > 0 || needsLazyLoading,
        parentBranches,
        data: dummyBranch.data,
        children: null
    }

    branchFlatMap.set(currentPath, curBranch)

    if(!needsLazyLoading){
        curBranch.children = new Map();
        if (childrenLength > 0) {
            Object.entries(dummyBranch.children).forEach(([_childKey, dummyChildBranch]) => {
                const childInternalBranch = processDummyBranch(_childKey, dummyChildBranch, branchFlatMap, curBranch)
                curBranch.children.set(_childKey, childInternalBranch)
            })
        }
    }

    return curBranch;
}