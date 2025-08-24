import React, { useMemo, useEffect, useState, memo } from 'react'
import { useTablesContext } from '../../context'
import { ControllerRenderProps, useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel';
import { TABLES_MAP } from './lib';
import CurrentTableSelector from './components/CurrentTableSelector';
import ZodFormRenderer from '@/components/ZodFormRenderer';



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
        setQueryParams(filteredData);
    }

    useEffect(() => {
        form.reset(currentDefaultValues);
    }, [selectedTable, currentDefaultValues])

    return (
        <CollapsiblePanel
            title='Query Tool'
            contentClassName='overflow-y-scroll'
        >
            <ZodFormRenderer 
                form={form} 
                schema={table.schema} 
                onSubmit={onSubmit}
                submitButtonTitle='Query Database'
            >
                <CurrentTableSelector form={form} />
            </ZodFormRenderer>
        </CollapsiblePanel>
    )
})

export default DatabaseQueryPanel

