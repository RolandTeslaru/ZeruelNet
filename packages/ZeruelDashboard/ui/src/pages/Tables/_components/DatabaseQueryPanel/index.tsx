import React, { useMemo, useEffect, useState, memo } from 'react'
import { useTablesContext } from '../../context'
import { ControllerRenderProps, useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel';
import { Button, Form, FormField, FormItem, FormLabel, FormMessage, } from '@zeruel/shared-ui/foundations'
import { ZodPropertyObject } from './types';
import { TABLES_MAP } from './lib';
import CurrentTableSelector from './components/CurrentTableSelector';
import { arrayInputRender, integerInputRenderer, stringInputRenderer } from './components/renderers';


const INPUT_MAP = {
    "string": stringInputRenderer,
    "integer": integerInputRenderer,
    "number": integerInputRenderer,
    "array": arrayInputRender
} as const

const DatabaseQueryPanel = memo(() => {
    const { selectedTable, setQueryParams } = useTablesContext()

    const table = TABLES_MAP[selectedTable as keyof typeof TABLES_MAP]
    const currentSchema = TABLES_MAP[selectedTable as keyof typeof TABLES_MAP]?.schema
    const currentDefaultValues = TABLES_MAP[selectedTable as keyof typeof TABLES_MAP]?.defaultValues

    const form = useForm({
        resolver: currentSchema ? zodResolver(currentSchema) : undefined,
        defaultValues: currentDefaultValues
    })

    const onSubmit = (data: any) => {
        const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                // @ts-ignore
                acc[key] = value;
            }
            return acc;
        }, {});
        console.log("FILTERED DATA", data)
        setQueryParams(filteredData);
    }

    useEffect(() => {
        form.reset(currentDefaultValues);
        console.log("RESETTING FORM")
    }, [selectedTable, currentDefaultValues])

    return (
        <CollapsiblePanel
            title='Query Tool'
            contentClassName='overflow-scroll'
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                    <CurrentTableSelector form={form} />
                    {table && table.propertiesArray.map(([key, zodProp]: [key: string, zodProp: ZodPropertyObject]) =>
                        <FormField
                            control={form.control}
                            key={key}
                            // @ts-expect-error
                            name={key}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='font-sans text-neutral-400'>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</FormLabel>
                                    <FormItem>
                                        {(INPUT_MAP[zodProp.type] as (zodProp: ZodPropertyObject, field: ControllerRenderProps, control: Control) => React.ReactNode)(zodProp, field, form.control)}
                                    </FormItem>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    )}
                    <Button
                        variant="dashed1"
                        type="submit"
                        className='w-full border-blue-400/60 min-h-9 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono font text-xs mt-2'
                    >
                        Query Database
                    </Button>
                </form>
            </Form>
        </CollapsiblePanel>
    )
})

export default DatabaseQueryPanel

