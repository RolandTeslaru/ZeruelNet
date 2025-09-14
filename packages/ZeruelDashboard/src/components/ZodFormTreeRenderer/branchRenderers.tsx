import {
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    ContextMenu,
    ContextMenuItem,
    ContextMenuContent,
    ContextMenuTrigger,
} from '@zeruel/shared-ui/foundations'
import { ZodArrayObject, ZodIntegerObject, ZodPropertyObject, ZodStringObject } from "./types"
import { Control, ControllerRenderProps, FieldValues, useController, useFieldArray, UseFormReturn } from "react-hook-form";
import { DateRangePicker } from '@zeruel/shared-ui/foundations/DateRangePicker';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { DateRange } from 'react-day-picker';
import { useTrendsStore } from '../pages/Trends/context';
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper';
import { DummyTreeBranch, InternalTreeBranch } from '@zeruel/shared-ui/Tree/types';
import { getTreeStore, useTree } from '@zeruel/shared-ui/Tree/context';
import { buildArrayItemDummyBranch } from './utils';
import { createInternalBranch } from '@zeruel/shared-ui/Tree/utils';
import { ZodArrayItemDummyBranch, ZodArrayItemInternalBranch, ZodDummyBranch } from './types';
import { X } from '@zeruel/shared-ui/icons';

export interface RenderProps {
    form: UseFormReturn,
    className?: string
    branch: InternalTreeBranch
}

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
                name={data.fieldKey}
                render={({ field }) => (
                    <FormItem className='gap-1 w-full'>
                        {inner({ ...props, field })}
                    </FormItem>
                )}
            />
        )
    }
}





export const StringFieldRenderer = withFieldShell(({ field, branch, className, form }) => {
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
    else if (zodObject.enum)
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
    else
        return (
            <Input
                {...field}
                type='text'
                className={(className ?? '') + ' w-1/2 ml-auto'}
                placeholder='STRING'
                size="xs"
            />
        )
})





const IntegerFieldRenderer = withFieldShell(({ field, branch, className }) => {
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
})





const ArrayFieldRenderer = withFieldShell(({ field, branch, form }) => {
    const data = branch.data
    const zodObject = data.schema as ZodArrayObject

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: field.name
    })

    const store = getTreeStore()
    useEffect(() => {
        const dangerouslyOverridePropertyOnDataObjectInBranch = store
            .getState()
            .dangerouslyOverridePropertyOnDataObjectInBranch

        branch.children?.forEach((childBranch) => {
            dangerouslyOverridePropertyOnDataObjectInBranch({
                branchPath: childBranch.currentPath,
                propertyKey: "handleOnDelete",
                propertyData: (arrayItemName: string, requiredKey: string) => {
                    const currentValues: any[] = form.getValues()[field.name] ?? []
                    const idx = currentValues.findIndex(v => v[requiredKey] === arrayItemName)
                    if (idx !== -1) {
                        remove(idx)
                        store.getState().recursivelyEraseBranch({ branchPath: childBranch.currentPath })
                    }
                }
            })
        })
    }, [branch.children, form, remove])

    const firstRequiredProperty = zodObject.items.required[0]

    const onItemAdd = (itemName: string) => {
        // Check if the item is already in the field
        const values = form.getValues()[field.name] ?? []
        if (values.some(v => v[firstRequiredProperty] === itemName)) {
            return
        }
        append({ [firstRequiredProperty]: itemName })

        const itemProperties = {
            ...zodObject.items.properties
        }
        delete itemProperties[firstRequiredProperty]

        const newDummyBranch: DummyTreeBranch = buildArrayItemDummyBranch({
            itemName,
            itemProperties,
            requiredKey: firstRequiredProperty,
            allExpanded: false,
            index: fields.length, // pass current index of the new array item
            parentArrayFieldName: field.name,
            buildOpts: data.buildOpts
        })

        const { newBranch } = createInternalBranch(itemName, newDummyBranch, branch)
        store.getState().addInternalBranch({ branch: newBranch })
    }

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className='flex flex-row gap-1 w-full'>
            <Input
                className={' w-1/2 ml-auto'}
                placeholder={`ADD ITEM  (${firstRequiredProperty})`}
                size="xs"
                role="none"
                ref={inputRef}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const value = (e.currentTarget as HTMLInputElement).value
                        if (!value) return
                        onItemAdd(value);
                        (e.currentTarget as HTMLInputElement).value = ''
                        e.preventDefault()
                    }
                }}
            />
            <Button
                className='size-5 !p-0 rounded-full bg-input border-border-input'
                variant="accent"
                role="none"
                onClick={() => {
                    if (!inputRef.current) return

                    const value = inputRef.current.value
                    onItemAdd(value);
                    inputRef.current.value = ''
                }}
            >
                +
            </Button>
        </div>
    )
})







const ArrayItemRenderer = (
    { branch, form }:
        { branch: ZodArrayItemInternalBranch, form: UseFormReturn }
) => {
    return (
        <Button type="button" variant="destructive" size="xs" className='my-auto ml-auto !font-semibold'
            onClick={() => {
                const data = branch.data
                data?.handleOnDelete(data.itemName, data.requiredKey)
            }}
        >
            Remove
        </Button>
    )
}





export const DateRangePlainRenderer: INPUT_RENDERER_MAP_RETURN_TYPE = ({ form, branch }) => {
    const { field: sinceField } = useController({ name: 'since', control: form.control })
    const { field: untilField } = useController({ name: 'until', control: form.control })

    const onRangeUpdate = useCallback(({ range }: { range: DateRange }) => {
        const newSince = range?.from ? new Date(range.from) : undefined;
        if (newSince) {
            newSince.setDate(newSince.getDate() + 1);
        }
        const newSinceISO = newSince?.toISOString();

        if (newSinceISO !== sinceField.value) {
            sinceField.onChange(newSinceISO);
        }

        const newUntil = range?.to ? new Date(range.to) : undefined;
        if (newUntil) {
            newUntil.setDate(newUntil.getDate() + 1);
        }
        const newUntilISO = newUntil?.toISOString();

        if (newUntilISO !== untilField.value) {
            untilField.onChange(newUntilISO);
        }
    }, [sinceField, untilField]);

    return (
        <div className='w-auto ml-auto'>
            <DateRangePicker 
                horizontal 
                initialDateFrom={sinceField.value} 
                initialDateTo={untilField.value}
                onUpdate={onRangeUpdate} 
            />
        </div>
    )
}





// ----------------- RENDERER REGISTRY -----------------

export const RENDERERS = {
    string: StringFieldRenderer,
    integer: IntegerFieldRenderer,
    number: IntegerFieldRenderer,
    array: ArrayFieldRenderer,
    dateRange: DateRangePlainRenderer,
    arrayItem: ArrayItemRenderer,
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
