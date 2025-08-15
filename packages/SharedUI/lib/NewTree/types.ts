
export interface DummyTreeBranch{
    children?: Record<string, DummyTreeBranch>,
    data?: any
}

export type DummyTree = Record<string, DummyTreeBranch>

export interface TreeComponentProps {
    src: DummyTree
}

export interface InternalTreeBranch {
    key: string
    currentPath: string  // unique   (  path1.path2.path3.key ) 
    children: Map<string, InternalTreeBranch> | null, // if null then it means it will sbhow the option to check and load branches if any
    isExpanded: boolean,
    canBeExpanded: boolean
    needsLazyLoading?: boolean
    parentBranches: Map<string, InternalTreeBranch>
    data?: any
}

export type InternalTree = Record<string, InternalTreeBranch>

