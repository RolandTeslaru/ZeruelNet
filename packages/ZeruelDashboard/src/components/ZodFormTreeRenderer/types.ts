import { DummyTree, DummyTreeBranch, InternalTreeBranch } from "@zeruel/shared-ui/Tree/types"
import { z } from "zod"

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