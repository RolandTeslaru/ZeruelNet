import {
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@zeruel/shared-ui/foundations'
import { ZodArrayObject, ZodIntegerObject, ZodPropertyObject, ZodStringObject } from "../ZodFormRenderer/types"
import { Control, ControllerRenderProps, FieldValues, useController, useFieldArray, UseFormReturn } from "react-hook-form";
import { DateRangePicker } from '@zeruel/shared-ui/foundations/DateRangePicker';
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { useTrendsStore } from '../pages/Trends/context';
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper';
import { DummyTreeBranch, InternalTreeBranch } from '@zeruel/shared-ui/Tree/types';
import { getTreeStore, useTree } from '@zeruel/shared-ui/Tree/context';
import { createInternalBranch } from '@zeruel/shared-ui/Tree/utils';
import { buildZodTree } from './utils';
import { ZodDummyBranch } from './types';
import { X } from '@zeruel/shared-ui/icons';

export interface RenderProps {
    form: UseFormReturn,
    className?: string
    branch: InternalTreeBranch
}

// Higher Order Component that wraps a render function with react-hook-form <FormField> plumbing
// The inner function receives the same props plus the generated `field` from RHF and must return the actual form control JSX.
interface InnerFieldProps extends RenderProps {
    field: ControllerRenderProps
}

function withFieldShell(
    inner: (props: InnerFieldProps) => React.ReactNode
) {
    return (props: RenderProps) => {
        const { form, branch } = props
        const data = branch.data

        return (
            <FormField
                control={form.control}
                key={data.fieldKey}
                name={branch.key}
                render={({ field }) => (
                    <FormItem className='gap-1 w-full'>
                        {inner({ ...props, field })}
                        <FormMessage />
                    </FormItem>
                )}
            />
        )
    }
}

// ----------------- PLAIN RENDERER -----------------
// Used for branches that don't correspond to a react-hook-form field
export const PlainRenderer: INPUT_RENDERER_MAP_RETURN_TYPE = ({ branch }) => {
    if (branch.data?.canBeDeleted) {
        return (
            <Button type="button" variant="destructive" size="xs" className='my-auto ml-auto !font-semibold'
                onClick={() => branch.data?.onDelete()}
            >
                Remove
            </Button>
        )
    }
    return null
    const title = getTitle(branch)
    return title ? <p className='w-fit'>{title}</p> : null
}

// ----------------- FIELD RENDERERS -----------------
// Rewrite string / integer / array renderers using the HOC so the form wrapper is centralised

const stringInputInner: (props: InnerFieldProps) => React.ReactNode = ({ field, branch, className }) => {
    const data = branch.data
    const zodObject = data.schema as ZodStringObject

    if (zodObject.format === "date-time") {
        const onChange = (e: ChangeEvent<HTMLInputElement>) => {
            field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)
        }
        return (
            <Input
                {...field}
                type="date"
                className={(className ?? '') + ' w-1/2 ml-auto'}
                value={field.value ? new Date().toISOString().split('T')[0] : ''}
                onChange={onChange}
                size="xs"
            />
        )
    }
    else if (zodObject.enum) {
        return (
            <Select onValueChange={field.onChange} defaultValue={field.value ?? zodObject.default}>
                <SelectTrigger size='xs' className={(className ?? '') + " w-1/2 ml-auto focus:outline-hidden text-xs!"}>
                    <SelectValue placeholder="ENUM" className={field.value ? "text-white" : "text-neutral-200"} />
                </SelectTrigger>
                <SelectContent>
                    {zodObject.enum.map((value) => (
                        <SelectItem key={value} value={value}>
                            {value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )
    }

    return (
        <Input
            {...field}
            type='text'
            className={(className ?? '') + ' w-1/2 ml-auto'}
            placeholder='STRING'
            size="xs"
        />
    )
}

export const StringFieldRenderer = withFieldShell(stringInputInner)

const integerInputInner: (props: InnerFieldProps) => React.ReactNode = ({ field, branch, className }) => {
    const data = branch.data
    const zodObject = data.schema as ZodIntegerObject
    return (
        <Input
            {...field}
            className={(className ?? '') + ' w-1/2 ml-auto'}
            type="number"
            min={zodObject.minimum || zodObject.exclusiveMinimum}
            max={zodObject.maximum || zodObject.exclusiveMaximum}
            placeholder="INTEGER"
            step={0.1}
            size="xs"
        />
    )
}

export const IntegerFieldRenderer = withFieldShell(integerInputInner)

// Existing ArrayField renderer still needs special logic so keep as is but wrap with HOC
const arrayInputInner: (props: InnerFieldProps) => React.ReactNode = ({ field, branch, form }) => {
    const data = branch.data
    const zodObject = data.schema as ZodArrayObject

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: field.name
    })

    const store = getTreeStore()
    const firstRequiredProperty = zodObject.items.required[0]

    const onBranchAdd = (itemName: string) => {
        append({ [firstRequiredProperty]: itemName })

        if (firstRequiredProperty in zodObject.items.properties) {
            delete zodObject.items.properties[firstRequiredProperty]
        }

        const valueObject = buildZodTree("value", zodObject.items.properties, [], false)

        const newDummyBranch: DummyTreeBranch = {
            isExpanded: false,
            data: {
                canBeDeleted: true,
                onDelete: () => {
                    // safely locate current index of this item by matching the key property
                    const currentValues: any[] = form.getValues()[field.name] ?? []
                    const idx = currentValues.findIndex(v => v[firstRequiredProperty] === itemName)
                    if (idx !== -1){
                        remove(idx)
                        const branchPath = `${branch.currentPath}.${itemName}`
                        store.getState().recursivelyEraseBranch({branchPath })
                    }
                },
                schema: {
                    type: "arrayItem"
                }
            },
            children: {
                ...valueObject["value"].children
            }
        }
        const { newBranch } = createInternalBranch(itemName, newDummyBranch, branch)
        store.getState().addInternalBranch({ branch: newBranch })
    }

    return (
        <div className='flex flex-col gap-1 w-full'>
            <Input
                className={' w-1/2 ml-auto'}
                placeholder={`ADD ITEM  (${firstRequiredProperty})`}
                size="xs"
                role="none"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const value = (e.currentTarget as HTMLInputElement).value
                        if (!value) return
                        onBranchAdd(value)
                            ; (e.currentTarget as HTMLInputElement).value = ''
                        e.preventDefault()
                    }
                }}
            />
        </div>
    )
}

export const ArrayFieldRenderer = withFieldShell(arrayInputInner)

// Date range plain renderer remains as before but expose via const
export const DateRangePlainRenderer: INPUT_RENDERER_MAP_RETURN_TYPE = ({ form, branch }) => {
    const { field: sinceField } = useController({ name: 'since', control: form.control })
    const { field: untilField } = useController({ name: 'until', control: form.control })

    const onRangeUpdate = useCallback(({ range }: { range: DateRange }) => {
        sinceField.onChange(range?.from ? new Date(range.from).toISOString() : undefined)
        untilField.onChange(range?.to ? new Date(range.to).toISOString() : undefined)
    }, [sinceField, untilField])

    const title = getTitle(branch)

    return (
        <>
            {title && <p className='w-fit'>{title}</p>}
            <div className='w-auto ml-auto'>
                <DateRangePicker horizontal onUpdate={onRangeUpdate} initialDateFrom={sinceField.value} initialDateTo={untilField.value} />
            </div>
        </>
    )
}

// ----------------- RENDERER REGISTRY -----------------

export const RENDERERS = {
    string: { kind: 'field', render: StringFieldRenderer },
    integer: { kind: 'field', render: IntegerFieldRenderer },
    number: { kind: 'field', render: IntegerFieldRenderer },
    array: { kind: 'field', render: ArrayFieldRenderer },
    daterange: { kind: 'plain', render: DateRangePlainRenderer },
    plain: { kind: 'plain', render: PlainRenderer },
} as const

export type INPUT_RENDERER_MAP_RETURN_TYPE = (
    props: RenderProps
) => React.ReactNode

const getTitle = (branch: InternalTreeBranch) => {
    const data = branch?.data

    let title = null
    if (branch.key === "value")
        title === null
    else if (data?.isMin)
        title = "min"
    else if (data?.isMax)
        title = "max"
    else
        title = branch.key

    return title
}
