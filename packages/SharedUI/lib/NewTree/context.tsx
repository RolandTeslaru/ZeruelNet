import { createStore } from 'zustand';
import { createContext, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { InternalTreeBranch } from './types';
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"

enableMapSet()

type State = {
    structuredTree: Record<string, InternalTreeBranch>,
    branchesFlatMap: Map<string, InternalTreeBranch>
    queuedBranches: Map<string, Map<string,InternalTreeBranch>>  // first string is the currentPath for the parent Branch and second string is for each queuedBranch
}

type Actions = {
    setExpanded: (value: boolean, branchPath: string) => void
    addBranch: (branch: InternalTreeBranch, parentPaths: string[]) => void
    eraseBranch: (branchPath: string) => void
}

const createTreeStore = () =>
    createStore<State & Actions>()(
        immer(
            (set) => ({
                structuredTree: {},
                branchesFlatMap: new Map(),
                queuedBranches: new Map(),
                addBranch: (branch, parentPaths) => set(s => {
                    // Ceck for queued branches
                    const queuedBranches = s.queuedBranches.get(branch.currentPath)
                    if(queuedBranches){
                        branch.children ??= new Map() // make sure the map exists
                        
                        branch.children = new Map([
                            ...branch.children,
                            ...queuedBranches
                        ])

                        queuedBranches.forEach(qBranch => {
                            qBranch.parentBranches.set(branch.currentPath, branch)
                        })

                        s.queuedBranches.delete(branch.currentPath)
                    }
                    
                    // Add in the flat Map
                    s.branchesFlatMap.set(branch.currentPath, branch)

                    // Add the branch itself to every parent it requires it
                    parentPaths.forEach(parentPath => {
                        if(!s.branchesFlatMap.has(parentPath)) 
                            return
                        const parentBranch = s.branchesFlatMap.get(parentPath)
                        if(!parentBranch.children)
                            parentBranch.children = new Map()

                        parentBranch.children.set(branch.currentPath, branch)
                        parentBranch.canBeExpanded = true;
                        branch.parentBranches.set(parentPath, parentBranch)
                    })
                }),

                setExpanded: (value, branchPath) => set(s => {
                    if(!s.branchesFlatMap.has(branchPath))
                        return

                    const branch = s.branchesFlatMap.get(branchPath)
                    branch.isExpanded = value
                }),
                eraseBranch: (branchPath) => set(s => {
                    if(!s.branchesFlatMap.has(branchPath))
                        return

                    const branch = s.branchesFlatMap.get(branchPath)

                    // Delete every refrence its parents could have
                    branch.parentBranches.forEach((_parentBranch) => {
                        if(!_parentBranch.children) return
                        _parentBranch.children.delete(branch.currentPath)

                        if(_parentBranch.children.size === 0)
                            _parentBranch.canBeExpanded = false;
                    })

                    // finally delete the branch itself
                    s.branchesFlatMap.delete(branchPath)
                    branch.children = new Map()
                    branch.data = undefined
                    branch.parentBranches = new Map()
                })
            }))
    );


// function mergeMap(finalMap: Map<string, any>, maps: Map<string, any>[]){
//     maps.forEach(_map => {
//         Object.entries(_map).forEach(([path, data]) => {
//             finalMap.set(path, data)
//         })
//     })
// }