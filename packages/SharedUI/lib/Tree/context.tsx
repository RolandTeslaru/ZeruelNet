import { createStore, useStore } from 'zustand';
import { createContext, memo, useContext, useImperativeHandle, useMemo } from 'react';
import type { StoreApi } from 'zustand';
import { DummyTree, DummyTreeBranch, InternalTree, InternalTreeBranch, TreeProviderProps } from './types';
import { immer } from "zustand/middleware/immer"
import { enableMapSet, WritableDraft } from "immer"
import { shallow } from 'zustand/shallow';

enableMapSet()

type State = {
    tree: InternalTree,
    branchesFlatMap: Map<string, InternalTreeBranch>
    queuedBranches: Map<string, Map<string, InternalTreeBranch>>  // first string is the currentPath for the parent Branch and second string is for each queuedBranch
}

type Actions = {
    setExpanded: (value: boolean, branchPath: string) => void
    addInternalBranch: (props: { branch: InternalTreeBranch, state?: WritableDraft<TreeStore> }) => void
    // addMultipleBranches: (branchesToBeAdded: Set<InternalTreeBranch>) => void,
    attachLoadedChildren: (children: Map<string, InternalTreeBranch>, parentPath: string) => void
    eraseBranch: (branchPath: string) => void
    recursivelyEraseBranch: (props: { branchPath: string, state?: WritableDraft<TreeStore> }) => void
    setBranchMounted: (value: boolean, branchPath: string) => void
    setBranchLoading: (branchPath: string, value: boolean) => void
}

export type TreeStore = State & Actions

const createTreeStore = (processedTree: InternalTree, branchFlatMap: Map<string, InternalTreeBranch>) =>
    createStore<TreeStore>()(
        immer(
            (set, get) => ({
                tree: processedTree,
                treeStucture: {},
                branchesFlatMap: branchFlatMap,
                queuedBranches: new Map(),
                setBranchLoading: (branchPath, value) => set(s => {
                    const branch = s.branchesFlatMap.get(branchPath)
                    if (!branch)
                        return

                    branch.isLoading = value;
                }),
                addInternalBranch: ({ branch, state }) => {
                    const execute = (s: WritableDraft<TreeStore>) => {
                        // Ceck for queued branches
                        const queuedBranches = s.queuedBranches.get(branch.currentPath)
                        if (queuedBranches) {
                            branch.children ??= new Map() // make sure the map exists

                            branch.children = new Map([
                                ...branch.children,
                                ...queuedBranches
                            ])

                            queuedBranches.forEach(qBranch => {
                                qBranch.parentPaths.add(branch.currentPath)
                            })

                            s.queuedBranches.delete(branch.currentPath)
                        }

                        // Add in the flat Map
                        s.branchesFlatMap.set(branch.currentPath, branch)

                        // Recursively add all children of this branch
                        if (branch.children && branch.children.size > 0) {
                            branch.children.forEach(childBranch => {
                                if (!s.branchesFlatMap.has(childBranch.currentPath)) {
                                    // Ensure child's parentPaths contains current branch
                                    childBranch.parentPaths.add(branch.currentPath)
                                    // Reuse same logic for each child
                                    s.addInternalBranch({ branch: childBranch, state: s })
                                }
                            })
                        }

                        // Add the branch itself to every parent it requires it
                        branch.parentPaths.forEach(parentPath => {
                            if (!s.branchesFlatMap.has(parentPath))
                                return
                            const parentBranch = s.branchesFlatMap.get(parentPath)
                            if (!parentBranch.children)
                                parentBranch.children = new Map()

                            parentBranch.children.set(branch.key, branch)
                            parentBranch.canBeExpanded = true;
                        })
                    }

                    if (state)
                        execute(state)
                    else
                        set(s => { execute(s) })
                },
                // addMultipleBranches: (branchesToBeAdded) => set(s => {
                //     branchesToBeAdded.forEach(branch => {
                //       s.addInternalBranch({branch, state: s})
                //     })
                // }),
                setBranchMounted: (value, branchPath) => set(s => {
                    if (!s.branchesFlatMap.has(branchPath))
                        return

                    const branch = s.branchesFlatMap.get(branchPath)
                    branch.isMounted = value
                }),
                setExpanded: (value, branchPath) => set(s => {
                    if (!s.branchesFlatMap.has(branchPath))
                        return

                    const branch = s.branchesFlatMap.get(branchPath)
                    branch.isExpanded = value
                }),
                attachLoadedChildren: (internalBranches, parentPath) => set(s => {
                    if (internalBranches.size === 0) {
                        const branch = s.branchesFlatMap.get(parentPath)
                        if (branch) {
                            branch.children = internalBranches
                            branch.canBeExpanded = false
                        }
                    } else {
                        internalBranches.forEach(_branch => {
                            s.addInternalBranch({ branch: _branch, state: s })
                        })
                    }
                }),
                // Erases the Branch but not its children
                eraseBranch: (branchPath) => set(s => {
                    if (!s.branchesFlatMap.has(branchPath))
                        return

                    const branch = s.branchesFlatMap.get(branchPath)

                    // Delete every refrence its parents could have
                    deleteCurrentBranchFromParents(branch, s)

                    // finally delete the branch itself
                    s.branchesFlatMap.delete(branchPath)
                    branch.children = new Map()
                    branch.data = undefined
                    branch.parentPaths = new Set()
                }),
                // Erases the Branch and recursivly its child branches
                recursivelyEraseBranch: ({ branchPath, state }) => {
                    const execute = (s: WritableDraft<TreeStore>) => {
                        if (!s.branchesFlatMap.has(branchPath))
                            return

                        const branch = s.branchesFlatMap.get(branchPath)

                        // Delete every refrence its parents could have
                        deleteCurrentBranchFromParents(branch, s)

                        // Delete every child recursevly
                        branch.children?.forEach(_childBranch => {
                            s.recursivelyEraseBranch({
                                branchPath: _childBranch.currentPath,
                                state: s
                            })
                            branch.children.delete(_childBranch.key)
                        })

                        // finally delete the branch itself
                        s.branchesFlatMap.delete(branchPath)
                        branch.children = null
                        branch.data = undefined
                        branch.parentPaths = null
                    }

                    if (state)
                        execute(state)
                    else
                        set(s => execute(s))
                }
            }))
    );


const Context = createContext<StoreApi<TreeStore> | null>(null)


export const TreeProvider: React.FC<TreeProviderProps> = memo(({ children, processedTree, branchFlatMap, ref }) => {

    const storeObject = useMemo(() =>
        createTreeStore(processedTree, branchFlatMap),
        [processedTree, branchFlatMap])

    useImperativeHandle(ref, () => {
        return {
            store: storeObject
        }
    }, [storeObject])

    return (
        <Context.Provider value={storeObject}>
            {children}
        </Context.Provider>
    )
})


export function useTree<T>(
    selector: (s: TreeStore) => T,
) {
    const store = useContext(Context);
    if (!store) throw new Error('Missing TreeProvider');
    return useStore(store, selector);
}

export function getTreeStore() {
    const store = useContext(Context)
    return store
}

export function useBranch(path: string) {
    return useTree(state => state.branchesFlatMap.get(path));
}

// function mergeMap(finalMap: Map<string, any>, maps: Map<string, any>[]){
//     maps.forEach(_map => {
//         Object.entries(_map).forEach(([path, data]) => {
//             finalMap.set(path, data)
//         })
//     })
// }



const deleteCurrentBranchFromParents = (currentBranch: InternalTreeBranch, s: WritableDraft<TreeStore>) => {
    currentBranch.parentPaths.forEach((_parentPath) => {
        const _parentBranch = s.branchesFlatMap.get(_parentPath)
        if (!_parentBranch.children) return
        _parentBranch.children.delete(currentBranch.key)

        if (_parentBranch.children.size === 0)
            _parentBranch.canBeExpanded = false;
    })
}