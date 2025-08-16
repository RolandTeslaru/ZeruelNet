import React from "react"
import { TreeStore } from "./context"

export interface DummyTreeBranch{
    children?: Record<string, DummyTreeBranch>
    isExpanded?: boolean
    data?: any
}

export type DummyTree = Record<string, DummyTreeBranch>

export interface TreeComponentProps {
    src: DummyTree
    className?: string
    renderBranch?: RenderBranchFunction
    loadBranchChildren?: LoadBranchChildrenFunction
}

export interface InternalTreeBranch {
    key: string
    currentPath: string  // unique   (  path1.path2.path3.key ) 
    children: Map<string, InternalTreeBranch> | null, // if null then it means it will sbhow the option to check and load branches if any
    isExpanded: boolean,
    canBeExpanded: boolean
    needsLazyLoading?: boolean
    parentPaths: Set<string>
    data?: any
    isLoading: boolean
}

export type InternalTree = Record<string, InternalTreeBranch>





export type BranchTemplateProps = React.FC<{
    children: React.ReactNode,
    className?: string,
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
    onContextMenu?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
    listClassNames?: string,
} > & React.HTMLAttributes<HTMLDivElement>

export type LoadBranchChildrenFunction = (
    parentBranch: InternalTreeBranch,
    treeState: TreeStore
) => Map<string, InternalTreeBranch> | Promise<Map<string, InternalTreeBranch>>

export type RenderBranchFunction = (branch: InternalTreeBranch, BranchTemplate: BranchTemplateProps) => React.ReactNode
export interface BranchComponentProps {
    path: string
    level: number
    siblingsLen: number
    indexToParent: number
    renderBranch: RenderBranchFunction
    loadBranchChildren: LoadBranchChildrenFunction
}






