import { DummyTree, DummyTreeBranch } from "@zeruel/shared-ui/Tree/types"
import { z } from "zod"

export const buildZodBranchTree = (
    parentBranch: DummyTreeBranch,
    zodProp: z.core.JSONSchema._JSONSchema & Object,
    key?: string,
): DummyTreeBranch => {
    const branch: DummyTreeBranch = {
        isExpanded: true,
        children: {}
    }

    // @ts-expect-error
    if (zodProp.type === "string" || zodProp.type === "number") {
        const hasForm = "format" in zodProp
        const isInline = typeof key === "string" && key.length < 10 && !hasForm

        if (isInline) {
            branch.data = {
                schema: zodProp,
                fieldKey: key,
                renderType: "inline"
            }
        } else {
            branch.children["value"] = {
                isExpanded: true,
                children: {},
                data: {
                    schema: zodProp,
                    fieldKey: key,
                    renderType: "stacked"
                }
            }
        }

    }

    return branch
}

export type BuildZodTreeRuleCallback = (
    properties: Record<string, z.core.JSONSchema._JSONSchema>,
    tree: DummyTree,
    rootTreeName: string,
) => void


export const buildZodTree = (rootTreeName: string, schema: z.ZodObject, rules?: BuildZodTreeRuleCallback[]) => {
    const properties = z.toJSONSchema(schema).properties
    const rootBranch: DummyTreeBranch = {
        isExpanded: true,
        children: {}
    }
    const tree: DummyTree = {
        [rootTreeName]: rootBranch
    }

    rules.forEach(rule => {
        rule(properties, tree, rootTreeName)
    })

    

    Object.entries(properties).forEach(([key, zodProp]:
        [a: string, b: z.core.JSONSchema._JSONSchema & Object,]
    ) => {
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
                data: {
                    schema: zodProp,
                    fieldKey: key,
                    renderType: "inline",
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
            children: {
                value: {
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
    }
}