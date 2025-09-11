import { DummyTree } from "@zeruel/shared-ui/Tree/types"
import { z } from "zod"
import { BuildZodTreeRuleCallback, ZodBranchDataObject, ZodDummyBranch } from "./types"


const defaultDataObject: ZodBranchDataObject = {
    renderKind: "plain",
    renderOrder: "inline"
}

export const buildZodBranchTree = (
    parentBranch: ZodDummyBranch,
    zodProp: z.core.JSONSchema._JSONSchema & z.ZodObject,
    key?: string,
): ZodDummyBranch => {
    const branch: ZodDummyBranch = {
        isExpanded: true,
        children: {},
        data: {...defaultDataObject}
    }

    const hasFormat = "format" in zodProp
    let renderOrder = "inline"

    if(key.length > 10 || hasFormat)
        renderOrder = "columm"

    if(renderOrder === "inline"){
        branch.data = {
            schema: zodProp,
            fieldKey: key,
            renderOrder: "row",
            renderkind: "plain",
        }
    } else {
        branch.children["value"] = {
            isExpanded: true,
            children: {},
            data: {
                schema: zodProp,
                fieldKey: key,
                renderOrder: "column",
                renderKind: zodProp.type,
            }
        }
    }

    return branch
}




export const buildZodTree = (rootTreeName: string, properties: Record<string, z.core.JSONSchema._JSONSchema>, rules?: BuildZodTreeRuleCallback[], allExpanded: boolean = true) => {
  
    const rootBranch: ZodDummyBranch = {
        isExpanded: allExpanded,
        children: {},
        data: {...defaultDataObject}
    }
    const tree: DummyTree = {
        [rootTreeName]: rootBranch
    }

    rules?.forEach(rule => {
        rule(properties, tree, rootTreeName)
    })

    

    Object.entries(properties).forEach(([key, zodProp]:
        [a: string, b: z.core.JSONSchema._JSONSchema & z.ZodObject,]
    ) => {
        const minMatch = key.match(/^min_(.+)$/)
        const maxMatch = key.match(/^max_(.+)$/)

        if (minMatch || maxMatch) {
            const baseKey = (minMatch?.[1] || maxMatch?.[1]) as string

            if (!tree[rootTreeName].children[baseKey]) {
                tree[rootTreeName].children[baseKey] = {
                    isExpanded: allExpanded,
                    data: {...defaultDataObject},
                    children: {}
                }
            }

            // Create a leaf under the base branch, but keep the original key for form binding
            tree[rootTreeName].children[baseKey].children[key] = {
                isExpanded: allExpanded,
                children: {},
                data: {
                    schema: zodProp,
                    fieldKey: key,
                    renderOrder: "inline",
                    renderKind: zodProp.type,
                    isMin: minMatch,
                    isMax: maxMatch
                }
            }
        } else {
            const branch = buildZodBranchTree(rootBranch, zodProp, key)
            tree[rootTreeName].children[key] = branch
        }
    })

    return tree
}


export const overrideTimeRangeRule: BuildZodTreeRuleCallback = (properties, tree, rootTreeName) => {
    if ("since" in properties && "until" in properties) {
        delete properties["since"]
        delete properties["until"]

        tree[rootTreeName].children["range"] = {
            isExpanded: true,
            data: {
                schema: {
                    type: "daterange"
                },
                isDateRange: true,
                fieldKey: "range"
            },
            children: {}
        }
    }
}