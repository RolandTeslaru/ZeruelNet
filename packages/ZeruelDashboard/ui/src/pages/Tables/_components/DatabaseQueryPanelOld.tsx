import { useTablesContext } from '../context'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import {
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    DualRangeSlider,
    Slider,
    Calendar,
    Popover, PopoverTrigger, PopoverContent,
    Button,
} from '@zeruel/shared-ui/foundations'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { VideosQuerySchema, VideoFeaturesQuerySchema, CommentsQuerySchema } from '@zeruel/dashboard-types'
import { z } from 'zod'
import React from 'react'
import { DateRangePicker } from '@zeruel/shared-ui/foundations/DateRangePicker'

const DATA_TABLES = [
    "videos",
    "comments",
    "video_features"
]

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

type WidgetType =
    | 'text'
    | 'number'
    | 'select'
    | 'dateRange' 
    | 'hidden'


type ManualFieldSpec = {
    widget: WidgetType
    label?: string
    options?: string[] // for select
    pairWith?: string  // for grouped widgets
}

type TableFieldConfig = Record<string, ManualFieldSpec>

const FIELDS_CONFIG: Record<'videos' | 'video_features' | 'comments', TableFieldConfig> = {
    videos: {
        hashtag: { widget: 'text', },
        timestamp: { widget: 'select', options: ['created_at', 'updated_at'], },
        sort: { widget: 'select', options: ['asc', 'desc'] },
        since: { widget: 'dateRange', pairWith: 'until' },
        limit: { widget: 'number' },
        offset: { widget: 'number'},
    },
    video_features: {
        detected_language: { widget: 'text' },
        enrichment_status: { widget: 'select', options: ['completed', 'failed']},
        min_alignment: { widget: 'number' },
        max_alignment: { widget: 'number' },
        min_polarity: { widget: 'number' },
        max_polarity: { widget: 'number' },
        timestamp: { widget: 'select', options: ['last_enriched_at', 'polarity', 'llm_overall_alignment'] },
        sort: { widget: 'select', options: ['asc', 'desc'] },
        since: { widget: 'dateRange', pairWith: 'until' },
        limit: { widget: 'number' },
        offset: { widget: 'number'},
    },
    comments: {
        author: { widget: 'text', label: 'Author' },
        video_id: { widget: 'text', label: 'Video ID' },
        comment_id: { widget: 'text', label: 'Comment ID' },
        parent_comment_id: { widget: 'text', label: 'Parent Comment ID' },
        text_contains: { widget: 'text', label: 'Text contains' },
        min_likes_count: { widget: 'number', label: 'Min likes' },
        max_likes_count: { widget: 'number', label: 'Max likes' },
        sort_by: { widget: 'select', options: ['likes_count', 'created_at', 'updated_at'], label: 'Sort by' },
        sort_dir: { widget: 'select', options: ['asc', 'desc'], label: 'Sort direction' },
        since: { widget: 'dateRange', pairWith: 'until', label: 'Date range' },
        limit: { widget: 'number', label: 'Limit' },
        offset: { widget: 'number', label: 'Offset' },
    },
}

const getNumberConstraints = (schema: any) => {
    const inner = unwrapZodType(schema)
    const checks = Array.isArray(inner?._def?.checks) ? inner._def.checks : []
    const minCheck = checks.find((c: any) => c.kind === 'min')
    const maxCheck = checks.find((c: any) => c.kind === 'max')
    const multipleOf = checks.find((c: any) => c.kind === 'multipleOf')
    const min = typeof minCheck?.value === 'number' ? minCheck.value : undefined
    const max = typeof maxCheck?.value === 'number' ? maxCheck.value : undefined
    const step = typeof multipleOf?.value === 'number'
        ? multipleOf.value
        : (typeof min === 'number' && typeof max === 'number' && Math.abs(max - min) <= 2 ? 0.01 : 1)
    return { min, max, step }
}

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

const getEnumOptions = (zodType: any): string[] => {
    const inner = unwrapZodType(zodType)
    if (inner._def?.typeName === 'ZodEnum') {
        return inner._def.values
    }
    return []
}

const renderSelectField = (
    key: string,
    zodType: any,
    form: any,
    explicitOptions?: string[],
) => {
    const options = explicitOptions && explicitOptions.length > 0 ? explicitOptions : getEnumOptions(zodType)
    return (
        <FormField
            key={key}
            control={form.control}
            name={key}
            render={({ field }) => (
                <FormItem className='flex flex-row justify-between'>
                    <FormLabel className='font-sans text-neutral-400'>{key.replace(/_/g, ' ')}</FormLabel>
                    <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className='w-fit min-w-23'>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const parseIso = (value: unknown): Date | undefined => {
    if (typeof value !== 'string' || !value) return undefined
    const d = new Date(value)
    return isNaN(d.getTime()) ? undefined : d
}
const toIso = (date: Date | undefined): string | undefined => date ? date.toISOString() : undefined
const formatDate = (date: Date | undefined): string => date ? date.toLocaleDateString('en-CA') : ''

const DateRangePair = ({ sinceKey, untilKey, form }: { sinceKey: string, untilKey:string, form: any}) => {
    const since = parseIso(form.watch(sinceKey))
    const until = parseIso(form.watch(untilKey))
    const selected: any = { from: since, to: until }
    return (
        <FormItem key={`${sinceKey}_${untilKey}`} className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
                <FormLabel className='font-inter text-neutral-400'>Date range</FormLabel>
                <FormControl>
                    <DateRangePicker
                        initialDateFrom={since ?? new Date()}
                        initialDateTo={until}
                        onUpdate={({ range }) => {
                            form.setValue(sinceKey, toIso(range.from), { shouldDirty: true })
                            form.setValue(untilKey, toIso(range.to), { shouldDirty: true })
                        }}
                    />
                    {/*  */}
                </FormControl>
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
                        {fieldType === 'number' ? (
                             (() => {
                                const { min, max, step } = getNumberConstraints(actualType)
                                return (
                                    <Input
                                        type='number'
                                        className='w-24 !text-xs'
                                        min={min}
                                        max={max}
                                        step={step}
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                                        value={field.value ?? ''}
                                    />
                                );
                            })()
                        ) : (
                            <Input 
                                type={fieldType}
                                placeholder={`${key}`}
                                className='w-24 !text-xs'
                                {...field}
                                value={field.value ?? ''}
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
    const { selectedTable, setSelectedTable, setQueryParams } = useTablesContext()

    const currentSchema = SCHEMA_MAP[selectedTable as keyof typeof SCHEMA_MAP]

    const defaultValues = React.useMemo(() => {
        if (!currentSchema) return {}
        const res = (currentSchema as any).safeParse({})
        return res.success ? res.data : {}
    }, [currentSchema])

    const form = useForm({
        resolver: currentSchema ? zodResolver(currentSchema) : undefined,
        defaultValues,
    })

    React.useEffect(() => {
        form.reset(defaultValues)
    }, [defaultValues, form])

    const fields = React.useMemo(() => {
        if (!currentSchema) return [] as Array<React.ReactElement>

        console.log("DEFAULT VALUES ", defaultValues)
        console.log("CURRENT SCHEMA ", Object.entries(z.toJSONSchema(currentSchema).properties))

        const tableFields = FIELDS_CONFIG[selectedTable as keyof typeof FIELDS_CONFIG]
        const nodes: Array<React.ReactElement> = []
        const used = new Set<string>()

        for (const [key, spec] of Object.entries(tableFields)) {
            if (used.has(key)) continue
            const type = (currentSchema as any).shape[key]

            // Manual spec drive
            switch (spec.widget) {
                case 'hidden':
                    used.add(key)
                    continue
                case 'dateRange':
                    if (spec.pairWith) {
                        used.add(key); used.add(spec.pairWith)
                        nodes.push(<DateRangePair key={key} sinceKey={key} untilKey={spec.pairWith} form={form}/>)
                    }
                    continue
                case 'select':
                    nodes.push(renderSelectField(key, type, form, spec.options))
                    continue
                case 'number':
                case 'text':
                default:
                    nodes.push(renderFormField(key, type, form))
            }
        }

        return nodes
    }, [currentSchema, form, selectedTable])

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
                        setQueryParams({}) // Clear previous filters
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

                {currentSchema && (
                    <div className="space-y-4 mt-4">
                        {fields}
                    </div>
                )}
                <Button
                    type="button"
                    variant="dashed1"
                    className='border-blue-400/60 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono font text-xs mt-2'
                    onClick={form.handleSubmit((values) => {
                        const sanitized: Record<string, any> = {};
                        Object.entries(values).forEach(([k, v]) => {
                            if (v !== undefined && v !== "") {
                                sanitized[k] = v;
                            }
                        });
                        setQueryParams(sanitized);
                    })}
                >
                    Query Database
                </Button>
            </Form>
        </CollapsiblePanel>
    )
}

export default DatabaseQueryPanel