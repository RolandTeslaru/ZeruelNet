import { DummyTree, DummyTreeBranch, InternalTreeBranch } from "@zeruel/shared-ui/Tree/types"
import { z } from "zod"

export type ZodPropertyObject = ZodIntegerObject | ZodStringObject | ZodArrayObject

export type ZodIntegerObject = {
    type: "integer",
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: number,
    exclusiveMaximum?: number
}

export type ZodStringObject = {
    type: "string",
    format?: "date-time",
    enum?: string[],
    default?: string
    minLength?: number
}

export type ZodArrayObject = {
    type: "array",
    minItems: number,
    items: {
        type: "object",
        properties: Record<string, ZodPropertyObject>,
        required: string[],
    }
}





export type BuildZodTreeRuleCallback = (props: {
    properties: Record<string, z.core.JSONSchema._JSONSchema>,
    tree: DummyTree,
    rootTreeName: string,
    parentBranch: ZodDummyBranch
    buildOpts: ZodTreeBuildOpts
}) => void

export type ZodBranchDataObject = {
    schema?: Partial<z.core.JSONSchema._JSONSchema & z.ZodObject>,
    fieldKey?: string,
    renderOrder: "inline" | "column",
    renderKind: string,
    handleOnDelete?: (itemName: string, requiredKey: string) => void
    buildOpts?: ZodTreeBuildOpts
}

export type ZodDummyBranch = Omit<DummyTreeBranch, "data"> & {
    data: ZodBranchDataObject
}

export type ZodArrayItemDummyBranch = Omit<ZodDummyBranch, 'data'> & {
    data: {
        handleOnDelete: (itemName: string, requiredKey: string) => void
        itemName: string
        requiredKey: string
        renderOrder: "inline" | "column",
        renderKind: string,
        buildOpts?: ZodTreeBuildOpts
    }
}

export type ZodArrayItemInternalBranch = Omit<InternalTreeBranch, 'data'> & {
    data: {
        handleOnDelete: (itemName: string, requiredKey: string) => void
        itemName: string
        requiredKey: string
        renderOrder: "inline" | "column",
        renderKind: string
    }
}

export type ZodTreeBuildOpts = {
    overrideRenderOrder?: Record<string, "inline" | "column">
    maxTitleLengthUntilCutoff?: number
}