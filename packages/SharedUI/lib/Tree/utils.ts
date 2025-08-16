import { DummyTreeBranch, InternalTree, InternalTreeBranch } from "./types"

export const processDummyTree = (src: Record<string, DummyTreeBranch>) => {
    const root: InternalTree = {}
    const branchFlatMap: Map<string, InternalTreeBranch> = new Map()

    Object.entries(src).forEach(([_dummyBranchKey, _dummyBranch]) => {
        root[_dummyBranchKey] = processDummyBranch(_dummyBranchKey, _dummyBranch, branchFlatMap)
    })
    return { processedTree: root, branchFlatMap};
}

export const processDummyBranch = (key: string, dummyBranch: DummyTreeBranch, branchFlatMap: Map<string, InternalTreeBranch>, parentInternalBranch?: InternalTreeBranch,) => {
    const needsLazyLoading = dummyBranch.children === undefined
    const childrenLength = Object.values(dummyBranch.children ?? {}).length


    const currentPath = parentInternalBranch ? `${parentInternalBranch.currentPath}.${key}` : key
    const parentPaths = new Set<string>();
    if (parentInternalBranch)
        parentPaths.add(parentInternalBranch.currentPath)


    const curBranch: InternalTreeBranch = {
        key,
        currentPath,
        isExpanded: dummyBranch.isExpanded ?? false,
        canBeExpanded: childrenLength > 0 || needsLazyLoading,
        parentPaths,
        data: dummyBranch.data,
        children: null,
        isLoading: false
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