import { useTablesContext } from '../context'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { 
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, 
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, 
    DualRangeSlider,
    Slider,
} from '@zeruel/shared-ui/foundations'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { VideosQuerySchema, VideoFeaturesQuerySchema, CommentsQuerySchema } from '@zeruel/dashboard-types'
import { z } from 'zod'
import React from 'react'

const DATA_TABLES = [
    "videos",
    "comments",
    "video_features"
]

// Map table names to their schemas
const SCHEMA_MAP = {
    videos: VideosQuerySchema,
    comments: CommentsQuerySchema,
    video_features: VideoFeaturesQuerySchema
} as const

// Unwrap Zod wrappers to the underlying concrete type
const unwrapZodType = (schema: any): any => {
    let current = schema
    while (current?._def?.typeName === 'ZodOptional' || current?._def?.typeName === 'ZodEffects') {
        current = current._def?.innerType ?? current._def?.schema ?? current
    }
    return current
}

// Extract numeric constraints from a ZodNumber (min, max, step)
const getNumberConstraints = (schema: any) => {
    const inner = unwrapZodType(schema)
    const checks = Array.isArray(inner?._def?.checks) ? inner._def.checks : []
    const minCheck = checks.find((c: any) => c.kind === 'min')
    const maxCheck = checks.find((c: any) => c.kind === 'max')
    const multipleOf = checks.find((c: any) => c.kind === 'multipleOf')
    const min = typeof minCheck?.value === 'number' ? minCheck.value : undefined
    const max = typeof maxCheck?.value === 'number' ? maxCheck.value : undefined
    // Heuristic: if range is small or decimals likely, default step 0.01, else 1
    const step = typeof multipleOf?.value === 'number'
        ? multipleOf.value
        : (typeof min === 'number' && typeof max === 'number' && Math.abs(max - min) <= 2 ? 0.01 : 1)
    return { min, max, step }
}

// Helper function to get field type from Zod schema
const getFieldType = (zodType: any): 'text' | 'number' | 'select' | 'date' => {
    const inner = unwrapZodType(zodType)
    if (inner._def?.typeName === 'ZodString') {
        return 'text'
    }
    if (inner._def?.typeName === 'ZodNumber') {
        return 'number'
    }
    if (inner._def?.typeName === 'ZodEnum') {
        return 'select'
    }
    if (inner._def?.typeName === 'ZodDate') {
        return 'date'
    }
    return 'text'
}

// Helper function to get enum options
const getEnumOptions = (zodType: any): string[] => {
    const inner = unwrapZodType(zodType)
    if (inner._def?.typeName === 'ZodEnum') {
        return inner._def.values
    }
    return []
}

// Render a pair min_/max_ with DualRangeSlider
const renderMinMaxPair = (
    minKey: string,
    maxKey: string,
    minType: any,
    maxType: any,
    form: any,
) => {
    const minValue = form.watch(minKey)
    const maxValue = form.watch(maxKey)
    const innerMin = unwrapZodType(minType)
    const innerMax = unwrapZodType(maxType)
    const minChecks = Array.isArray(innerMin?._def?.checks) ? innerMin._def.checks : []
    const maxChecks = Array.isArray(innerMax?._def?.checks) ? innerMax._def.checks : []
    const minCheck = minChecks.find((c: any) => c.kind === 'min')
    const maxCheck = maxChecks.find((c: any) => c.kind === 'max')
    const fieldMin = typeof minCheck?.value === 'number' ? minCheck.value : -100
    const fieldMax = typeof maxCheck?.value === 'number' ? maxCheck.value : 100
    const step = (Math.abs(fieldMax - fieldMin) <= 2) ? 0.01 : 1

    const current: [number, number] = [
        typeof minValue === 'number' ? minValue : fieldMin,
        typeof maxValue === 'number' ? maxValue : fieldMax,
    ]

    return (
        <FormItem key={`${minKey}_${maxKey}`} className='flex flex-col gap-2'>
            <div className='flex flex-row justify-between'>
                <FormLabel className='font-inter text-neutral-400'>{minKey.replace('min_', '').replace(/_/g, ' ')} range</FormLabel>
                <FormControl>
                    <div className='relative w-24'>
                        <DualRangeSlider
                            min={fieldMin}
                            max={fieldMax}
                            step={step}
                            value={current}
                            onValueChange={([min, max]) => {
                                form.setValue(minKey, min, { shouldDirty: true })
                                form.setValue(maxKey, max, { shouldDirty: true })
                            }}
                        />
                    </div>
                </FormControl>
            </div>
            <div className='flex justify-between text-xs text-muted-foreground gap-2'>
                <Input
                    type='number'
                    className='w-16 !text-xs'
                    value={current[0]}
                    step={step}
                    min={fieldMin}
                    max={fieldMax}
                    onChange={(e) => {
                        const v = e.target.value === '' ? undefined : Number(e.target.value)
                        const clamped = typeof v === 'number' && !Number.isNaN(v) ? Math.max(fieldMin, Math.min(v, current[1])) : current[0]
                        form.setValue(minKey, clamped, { shouldDirty: true })
                    }}
                />
                <Input
                    type='number'
                    className='w-16 !text-xs'
                    value={current[1]}
                    step={step}
                    min={fieldMin}
                    max={fieldMax}
                    onChange={(e) => {
                        const v = e.target.value === '' ? undefined : Number(e.target.value)
                        const clamped = typeof v === 'number' && !Number.isNaN(v) ? Math.min(fieldMax, Math.max(v, current[0])) : current[1]
                        form.setValue(maxKey, clamped, { shouldDirty: true })
                    }}
                />
            </div>
        </FormItem>
    )
}

// Helper function to render form field based on type
const renderFormField = (key: string, zodType: any, form: any) => {
    const fieldType = getFieldType(zodType)
    const actualType = unwrapZodType(zodType)
    
    return (
        <FormField
            key={key}
            control={form.control}
            name={key}
            render={({ field }) => (
                <FormItem className='flex flex-row justify-between'>
                    <FormLabel className='font-sans text-neutral-400'>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</FormLabel>
                    <FormControl>
                        {fieldType === 'select' ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${key}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getEnumOptions(actualType).map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : fieldType === 'number' ? (
                            <div className='flex items-center gap-2 w-64'>
                                {(() => {
                                    const { min, max, step } = getNumberConstraints(actualType)
                                    const value = typeof field.value === 'number' ? field.value : (typeof min === 'number' ? min : 0)
                                    return (
                                        <>
                                            <div className='flex-1'>
                                                <Slider
                                                    min={min}
                                                    max={max}
                                                    step={step}
                                                    value={[value]}
                                                    onValueChange={([v]) => field.onChange(v)}
                                                />
                                            </div>
                                            <Input
                                                type='number'
                                                className='w-20 !text-xs'
                                                value={value}
                                                step={step}
                                                min={min}
                                                max={max}
                                                onChange={(e) => {
                                                    const v = e.target.value === '' ? undefined : Number(e.target.value)
                                                    if (typeof v === 'number' && !Number.isNaN(v)) {
                                                        field.onChange(v)
                                                    }
                                                }}
                                            />
                                        </>
                                    )
                                })()}
                            </div>
                        ) : (
                            <Input 
                                type={fieldType}
                                placeholder={`Enter ${key}`}
                                className='w-24 !text-xs'
                                {...field}
                            />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const DatabaseQueryPanel = () => {
    const { selectedTable, setSelectedTable } = useTablesContext()

    // Get the current schema based on selected table
    const currentSchema = SCHEMA_MAP[selectedTable as keyof typeof SCHEMA_MAP]
    
    const form = useForm({
        resolver: currentSchema ? zodResolver(currentSchema) : undefined,
        defaultValues: {}
    });

    // Build fields list with min/max grouping
    const fields = React.useMemo(() => {
        if (!currentSchema) return [] as Array<React.ReactElement>
        const entries = Object.entries((currentSchema as any).shape)

        const used = new Set<string>()
        const nodes: Array<React.ReactElement> = []

        for (const [key, type] of entries) {
            if (used.has(key)) continue
            if (key.startsWith('min_')) {
                const base = key.replace(/^min_/, '')
                const maxKey = `max_${base}`
                const maxType = (currentSchema as any).shape[maxKey]
                if (maxType) {
                    used.add(key)
                    used.add(maxKey)
                    nodes.push(renderMinMaxPair(key, maxKey, type, maxType, form))
                    continue
                }
            }
            if (key.startsWith('max_')) {
                const base = key.replace(/^max_/, '')
                const minKey = `min_${base}`
                if (entries.find(([k]) => k === minKey)) {
                    // will be handled when we hit min_
                    used.add(key)
                    continue
                }
            }
            nodes.push(renderFormField(key, type, form))
        }

        return nodes
    }, [currentSchema, form])

    return (
        <CollapsiblePanel
            title='Query Tool'
            contentClassName='overflow-scroll'
        >
            <Form {...form} >
                <Select
                    defaultValue={selectedTable}
                    onValueChange={(value) => {
                        setSelectedTable(value)
                        form.reset() // Reset form when table changes
                    }}
                >
                    <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-hidden text-xs! text-white">
                        <SelectValue placeholder="Select a Table" />
                    </SelectTrigger>
                    <SelectContent>
                        {DATA_TABLES.map((key) => (
                            <SelectItem key={key} value={key}>
                                {key}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {/* Dynamically render form fields based on selected schema */}
                {currentSchema && (
                    <div className="space-y-4 mt-4">
                        {fields}
                    </div>
                )}
            </Form>
        </CollapsiblePanel>
    )
}

export default DatabaseQueryPanel