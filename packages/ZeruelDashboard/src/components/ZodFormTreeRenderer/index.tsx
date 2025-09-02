import React, { memo, useCallback, useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from "zod"
import { DummyTree, DummyTreeBranch, RenderBranchFunction } from '@zeruel/shared-ui/Tree/types'
import { buildZodTree } from './utils'
import { Form, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '@zeruel/shared-ui/foundations'
import Tree from '@zeruel/shared-ui/Tree'
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { INPUT_RENDERER_MAP } from '../ZodFormRenderer/inputRenderers'

interface Props {
    form: UseFormReturn,
    onSubmit?: (data: any) => void
    schema: z.ZodObject
    rootTreeName: string
}

const ZodFromTreeRenderer: React.FC<Props> = memo(({
    form, onSubmit, schema, rootTreeName
}) => {

    const [tree, propArray] = useMemo(() => {
        const propArray = Object.entries(z.toJSONSchema(schema).properties)
        const tree = buildZodTree(rootTreeName, propArray)

        return [tree, propArray]
    }, [schema])

    const renderBranch: RenderBranchFunction = useCallback((branch, BranchTemplate) => {
        const data = branch?.data
        const zodSchema = data?.schema

        let title = null
        if(branch.key === "value")
            title === null
        else if(data?.isMin)
            title = "min"
        else if(data?.isMax)
            title = "max"
        else
            title = branch.key

        return (
            <BranchTemplate>
                {title &&
                    <p className='w-fit'>
                        {title}
                    </p>
                }
                {zodSchema &&
                    <FormField
                        control={form.control}
                        key={branch.key}
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
        )
    }, [])

    return (
        <>
            <Popover>
                <PopoverTrigger>Data</PopoverTrigger>
                <PopoverContent>
                    <DataViewerWrapper src={propArray} title='Data' />
                </PopoverContent>
            </Popover>
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


