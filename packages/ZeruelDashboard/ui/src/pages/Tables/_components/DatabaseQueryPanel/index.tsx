import React, { useMemo, useEffect, useState, memo } from 'react'
import { useTablesContext } from '../../context'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel';
import {Form, FormField, FormItem, FormLabel,} from '@zeruel/shared-ui/foundations'
import { ZodPropertyObject } from './types';
import { TABLES_MAP } from './lib';
import CurrentTableSelector from './components/CurrentTableSelector';
import { arrayInputRender, integerInputRenderer, stringInputRenderer } from './components/renderers';


const INPUT_MAP = {
    "string": stringInputRenderer,
    "integer": integerInputRenderer,
    "array": arrayInputRender
} as const

const DatabaseQueryPanel = memo(() => {
    const { selectedTable } = useTablesContext()

    const table = TABLES_MAP[selectedTable as keyof typeof TABLES_MAP]
    const currentSchema = TABLES_MAP[selectedTable as keyof typeof TABLES_MAP]?.schema
    const currentDefaultValues = TABLES_MAP[selectedTable as keyof typeof TABLES_MAP]?.defaultValues

    const form = useForm({
        resolver: currentSchema ? zodResolver(currentSchema) : undefined,
        defaultValues: currentDefaultValues
    })


    return (
        <CollapsiblePanel
            title='Query Tool'
            contentClassName='overflow-scroll'
        >
            <Form {...form}>
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
                                    {(INPUT_MAP[zodProp.type] as (zodProp: ZodPropertyObject, field: any) => React.ReactNode)(zodProp, field)}
                                </FormItem>
                            </FormItem>
                        )}
                    />
                
                )}
            </Form>
        </CollapsiblePanel>
    )
})

export default DatabaseQueryPanel

