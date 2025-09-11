import React, { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { UseFormReturn, useFormState } from 'react-hook-form'
import { z } from "zod"
import { BranchTemplateProps, DummyTree, DummyTreeBranch, InternalTreeBranch, RenderBranchFunction, TreeProviderRef } from '@zeruel/shared-ui/Tree/types'
import { buildZodTree, overrideTimeRangeRule } from './utils'
import { Button, ContextMenu, ContextMenuContent, ContextMenuTrigger, Form, Popover, PopoverContent, PopoverTrigger } from '@zeruel/shared-ui/foundations'
import Tree from '@zeruel/shared-ui/Tree'
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { RENDERERS } from './branchRenderers'
import { ArrowRight, Info } from '@zeruel/shared-ui/icons'
import Search from '@zeruel/shared-ui/Search'
import classNames from 'classnames'

interface Props {
    form: UseFormReturn,
    onSubmit?: (data: any) => void
    schema: z.ZodObject
    rootTreeName: string
    children?: React.ReactNode
}

const ZodFromTreeRenderer: React.FC<Props> = memo(({
    form, onSubmit, schema, rootTreeName, children
}) => {
    const tree = useMemo(() => {
        const properties =  z.toJSONSchema(schema).properties
        const tree = buildZodTree(rootTreeName, properties, [overrideTimeRangeRule])

        return tree
    }, [schema])

    const treeComponentRef = useRef(null) as TreeProviderRef

    const onSearchChange = useCallback((value: string) => {
        const store = treeComponentRef.current?.store;
        if (!store) return;

        const { branchesFlatMap, setBranchMounted } = store.getState();

        branchesFlatMap.forEach(branch => {
            if (branch.currentPath === rootTreeName) {
                setBranchMounted(true, branch.currentPath);
                return;
            }

            const pathWithoutRoot = branch.currentPath.replace(`${rootTreeName}.`, '');
            const visible =
                value === '' ||
                pathWithoutRoot.toLowerCase().includes(value.toLowerCase());

            setBranchMounted(visible, branch.currentPath);
        });
    }, [tree, treeComponentRef.current])


    const handleOnSubmit = useCallback((data: any) => {
        form.reset(form.getValues()); // Current value become default so dirty is set to false
        onSubmit?.(data)
    }, [onSubmit])


    // Reset the form after the tree render 
    // (because it gets dirty when it registers the fields)
    useEffect(() => {
        form.reset(form.getValues())
    }, [form])


    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleOnSubmit)}>
                    <Tree
                        src={tree}
                        renderBranch={(props) => renderFormBranch({ ...props, form })}
                        ref={treeComponentRef}
                    />
                    <div className='absolute flex flex-row top-3 right-0 gap-2'>
                        <FormSubmitButton form={form}/>
                        <Search className='h-auto my-auto ' onChange={onSearchChange} />
                    </div>
                    {children}
                </form>
            </Form>
        </>
    )
})

export default ZodFromTreeRenderer


const FormSubmitButton = ({form}: {form: UseFormReturn}) => {
    const { isDirty } = useFormState({ control: form.control });

    return (
        <Button 
            variant="accent"
            className={classNames(
                '!p-0 !h-5 !w-5 rounded-full',
                { "!bg-blue-500 !border-blue-400 !shadow-accent animate-pulse": isDirty }
            )}
        >
            <ArrowRight className='h-auto !text-white' />
        </Button>
    )
}

const renderFormBranch = (
    { branch, BranchTemplate, form }:
    { branch: InternalTreeBranch, BranchTemplate: BranchTemplateProps, form: UseFormReturn }
) => {
    const data = branch?.data
    const zodObject = data?.schema

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
                    {zodObject && (() => {
                        const entry = RENDERERS[(zodObject as any).type as keyof typeof RENDERERS] ?? RENDERERS.plain
                        return entry.render({ form, branch, className: '!w-full max-w-[130px]' })
                    })()}
                </BranchTemplate>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <DataViewerWrapper src={branch} title="Branch"/>
            </ContextMenuContent>
        </ContextMenu>
    )
}