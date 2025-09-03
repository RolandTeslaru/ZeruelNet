import React, { memo, useCallback, useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from "zod"
import { DummyTree, DummyTreeBranch, RenderBranchFunction } from '@zeruel/shared-ui/Tree/types'
import { buildZodTree } from './utils'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, Form, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '@zeruel/shared-ui/foundations'
import Tree from '@zeruel/shared-ui/Tree'
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { INPUT_RENDERER_MAP } from '../ZodFormRenderer/inputRenderers'
import { Info } from '@zeruel/shared-ui/icons'

interface Props {
    form: UseFormReturn,
    onSubmit?: (data: any) => void
    schema: z.ZodObject
    rootTreeName: string
}

const ZodFromTreeRenderer: React.FC<Props> = memo(({
    form, onSubmit, schema, rootTreeName
}) => {

    const [tree] = useMemo(() => {
        const tree = buildZodTree(rootTreeName, schema)

        return [tree]
    }, [schema])

    const renderBranch: RenderBranchFunction = useCallback((branch, BranchTemplate) => {
        const data = branch?.data
        const zodSchema = data?.schema

        let title = null
        if (branch.key === "value")
            title === null
        else if (data?.isMin)
            title = "min"
        else if (data?.isMax)
            title = "max"
        else
            title = branch.key

        return (
            <ContextMenu>
                <ContextMenuTrigger>

                    <BranchTemplate>
                        {title &&
                            <p className='w-fit'>
                                {title}
                            </p>
                        }
                        {zodSchema &&
                            <FormField
                                control={form.control}
                                key={data.fieldKey}
                                name={branch.key}
                                render={({ field }) => (
                                    <FormItem className='gap-1 w-full '>
                                        {INPUT_RENDERER_MAP[zodSchema.type]?.(zodSchema, field, form.control, "!w-full")}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        }
                    </BranchTemplate>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <DataViewerWrapper src={branch} title='Branch Data' />
                </ContextMenuContent>
            </ContextMenu>
        )
    }, [])

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tree
                        src={tree}
                        renderBranch={renderBranch}
                    />
                </form>
            </Form>
        </>
    )
})

export default ZodFromTreeRenderer


