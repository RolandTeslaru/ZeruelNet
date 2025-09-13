import { DummyTree } from "@zeruel/shared-ui/Tree/types"
import { z } from "zod"
import { BuildZodTreeRuleCallback, ZodArrayItemDummyBranch, ZodBranchDataObject, ZodDummyBranch, ZodTreeBuildOpts } from "./types"


const defaultDataObject: ZodBranchDataObject = {
    renderKind: "plain",
    renderOrder: "inline"
}

export const buildZodBranch = ({
    parentBranch,
    zodProp,
    key,
    defaultSubValue,
    buildOpts
}: {
    parentBranch: ZodDummyBranch,
    zodProp: z.core.JSONSchema._JSONSchema & { type: string },
    key?: string,
    defaultSubValue: unknown,
    buildOpts: ZodTreeBuildOpts
}): ZodDummyBranch => {
    const branch: ZodDummyBranch = {
        isExpanded: true,
        children: {},
        data: { ...defaultDataObject, buildOpts }
    }

    if (zodProp.type === 'array' && Array.isArray(defaultSubValue) && (defaultSubValue as any[]).length) {
        const arr: any[] = defaultSubValue
        const itemSchema: any = (zodProp as any).items

        // determine first required prop to use as identifier
        const firstRequired: string | undefined = (itemSchema?.required?.[0]) || undefined;

        arr.forEach((itemValue, idx) => {
            const itemKey = firstRequired && itemValue?.[firstRequired]
                ? String(itemValue[firstRequired])
                : String(idx);

            const itemBranch = buildArrayItemDummyBranch({
                itemName: itemKey,
                itemProperties: itemSchema.properties || {},
                requiredKey: firstRequired,
                allExpanded: false,
                index: idx,
                parentArrayFieldName: key,
                buildOpts
            });

            branch.children[itemKey] = itemBranch;
        })
    }

    const hasFormat = "format" in zodProp
    let renderOrder = "inline"

    const maximumTitleLength = buildOpts?.maxTitleLengthUntilCutoff ?? 10

    if (key.length > maximumTitleLength || hasFormat)
        renderOrder = "columm"

    if (buildOpts?.overrideRenderOrder && key in buildOpts.overrideRenderOrder)
        renderOrder = buildOpts[key]


    if (renderOrder === "inline") {
        branch.data = {
            //@ts-expect-error
            schema: zodProp,
            fieldKey: key,
            renderOrder: "inline",
            renderKind: zodProp.type,
            buildOpts
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
                buildOpts
            }
        }
    }

    return branch
}




export const buildZodTree = ({
    rootTreeName, properties, rules, allExpanded = true, defaultValues, fieldKeyPrefix, buildOpts
}: {
    rootTreeName: string,
    properties: Record<string, z.core.JSONSchema._JSONSchema>,
    rules?: BuildZodTreeRuleCallback[],
    allExpanded?: boolean,
    defaultValues?: Record<string, []>
    fieldKeyPrefix?: string,
    buildOpts?: ZodTreeBuildOpts
}) => {

    const rootBranch: ZodDummyBranch = {
        isExpanded: allExpanded,
        children: {},
        data: {
            ...defaultDataObject,
            buildOpts
        }
    }
    const tree: DummyTree = {
        [rootTreeName]: rootBranch
    }

    rules?.forEach(rule => {
        rule({
            properties, 
            tree, 
            rootTreeName,
            parentBranch: rootBranch,
            buildOpts
        })
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
                    data: { ...defaultDataObject, buildOpts },
                    children: {}
                }
            }

            let fieldKey = key
            if (fieldKeyPrefix)
                fieldKey = `${fieldKeyPrefix}.${fieldKey}`

            // Create a leaf under the base branch, but keep the original key for form binding
            tree[rootTreeName].children[baseKey].children[key] = {
                isExpanded: allExpanded,
                children: {},
                data: {
                    schema: zodProp,
                    fieldKey,
                    renderOrder: "inline",
                    renderKind: zodProp.type,
                    isMin: minMatch,
                    isMax: maxMatch,
                    buildOpts
                }
            }
        } else {
            // --- Regular property branch ----
            const branch = buildZodBranch({
                parentBranch: rootBranch,
                zodProp,
                key,
                defaultSubValue: defaultValues[key],
                buildOpts
            })
            tree[rootTreeName].children[key] = branch
        }
    })

    return tree
}

// ---------------- ARRAY ITEM BRANCH BUILDER ----------------

export const buildArrayItemDummyBranch = ({
    itemName,
    itemProperties,
    requiredKey,
    allExpanded = false,
    index,
    parentArrayFieldName,
    buildOpts
}: {
    itemName: string,
    itemProperties: Record<string, z.core.JSONSchema._JSONSchema>,
    requiredKey: string,
    allExpanded?: boolean,
    index: number,
    parentArrayFieldName: string,
    buildOpts: ZodTreeBuildOpts
}): ZodDummyBranch => {
    // Remove the first required property so it doesn't show twice as both key and field
    const propsCopy = { ...itemProperties };
    if (requiredKey && requiredKey in propsCopy) delete propsCopy[requiredKey];

    const valueObject = buildZodTree({
        rootTreeName: "value",
        properties: propsCopy,
        rules: [],
        allExpanded,
        fieldKeyPrefix: `${parentArrayFieldName}.${index}`,
        buildOpts
    })["value"];

    const branch: ZodArrayItemDummyBranch = {
        isExpanded: allExpanded,
        data: {
            handleOnDelete: () => { }, // temporary function, it can only be set in the parent array field
            // component via the useFieldArray hook
            itemName,
            requiredKey,
            renderKind: "arrayItem",
            renderOrder: "inline",
            buildOpts,
        },
        children: { ...valueObject.children },
    }

    return branch
}


export const overrideTimeRangeRule: BuildZodTreeRuleCallback = ({properties, tree, rootTreeName, parentBranch, buildOpts}) => {
    if (!('since' in properties && 'until' in properties)) return;

    delete properties["since"]
    delete properties["until"]

    // fake JSON-schema prop so we can call buildZodBranch
    const dummySchema = { type: 'dateRange', format: 'date-time' } as any;

    const newBranch = buildZodBranch({
        parentBranch,
        zodProp: dummySchema,
        key: "range",
        defaultSubValue: undefined,
        buildOpts
    })

    tree[rootTreeName].children["range"] = newBranch
}