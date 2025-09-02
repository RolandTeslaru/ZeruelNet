import { DummyTree, DummyTreeBranch } from "@zeruel/shared-ui/Tree/types"
import { z } from "zod"

export const buildZodBranchTree = (
    parentBranch: DummyTreeBranch,
    value: z.core.JSONSchema._JSONSchema,
    key?: string,
): DummyTreeBranch => {
    const branch: DummyTreeBranch = {
        isExpanded: true,
        children: {}
    }

    // @ts-expect-error
    if (value.type === "string" || value.type === "number") {
        const isInline = typeof key === "string" && key.length < 6
        branch.children["value"] = {
            isExpanded: true,
            children: {},
            data: isInline ? { schema: value, renderType: "inline" } : value
        }
    }

    return branch
}

export const buildZodTree = (rootTreeName: string, propertiesArray: [string, z.core.JSONSchema._JSONSchema][]) => {
    const rootBranch: DummyTreeBranch = {
        isExpanded: true,
        children: {}
    }
    const tree: DummyTree = {
        [rootTreeName]: rootBranch
    }

    propertiesArray.forEach(([key, zodProp]) => {
        const minMatch = key.match(/^min_(.+)$/)
        const maxMatch = key.match(/^max_(.+)$/)

        if (minMatch || maxMatch) {
            const baseKey = (minMatch?.[1] || maxMatch?.[1]) as string

            if (!tree[rootTreeName].children[baseKey]) {
                tree[rootTreeName].children[baseKey] = {
                    isExpanded: true,
                    children: {}
                }
            }

            // Create a leaf under the base branch, but keep the original key for form binding
            tree[rootTreeName].children[baseKey].children[key] = {
                isExpanded: true,
                children: {},
                data: { schema: zodProp, renderType: "inline", isMin: minMatch, isMax: maxMatch }
            }
        } else {
            const branch = buildZodBranchTree(rootBranch, zodProp, key)
            tree[rootTreeName].children[key] = branch
        }
    })

    return tree
}