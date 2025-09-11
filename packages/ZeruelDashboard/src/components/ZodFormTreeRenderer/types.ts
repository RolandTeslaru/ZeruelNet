import { DummyTree, DummyTreeBranch } from "@zeruel/shared-ui/Tree/types"
import {z} from "zod"

export type BuildZodTreeRuleCallback = (
    properties: Record<string, z.core.JSONSchema._JSONSchema>,
    tree: DummyTree,
    rootTreeName: string,
) => void

export type ZodBranchDataObject = {
    schema?: Partial<z.core.JSONSchema._JSONSchema & z.ZodObject>,
    isDateRange?: boolean,
    fieldKey?: string,
    renderOrder: "inline" | "column",
    renderKind: "plain" | "array" | "integer" | "string"
}

export type ZodDummyBranch = DummyTreeBranch & {
    data: ZodBranchDataObject
}
