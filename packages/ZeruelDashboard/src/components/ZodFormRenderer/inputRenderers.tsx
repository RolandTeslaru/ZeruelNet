import {
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@zeruel/shared-ui/foundations'
import { ZodArrayObject, ZodIntegerObject, ZodPropertyObject, ZodStringObject } from "./types"
import { Control, ControllerRenderProps, useController, useFieldArray } from "react-hook-form";
import { DateRangePicker } from '@zeruel/shared-ui/foundations/DateRangePicker';
import { useCallback, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { useTrendsStore } from '../pages/Trends/context';
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper';
import { DummyTreeBranch, InternalTreeBranch } from '@zeruel/shared-ui/Tree/types';
import { getTreeStore, useTree } from '@zeruel/shared-ui/Tree/context';
import { createInternalBranch } from '@zeruel/shared-ui/Tree/utils';
import { buildZodTree } from '../ZodFormTreeRenderer/utils';

export const stringInputRenderer = (
    { zodObject, field, control, className }: RenderProps & { zodObject: ZodStringObject }
) => {
    if (zodObject.format === "date-time") {
        return (
            <Input
                {...field}
                type="date"
                className={className + ' w-1/2 ml-auto'}
                value={field.value ? new Date().toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                size="xs"
            />
        )
    }
    if (zodObject.enum) {
        return (
            <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? zodObject.default}
            >
                <SelectTrigger
                    className={className + " w-1/2 ml-auto focus:outline-hidden text-xs!"}
                    size='xs'
                >
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
            className={className + ' w-1/2 ml-auto'}
            placeholder='STRING'
            size="xs"
        />
    )
}

export const integerInputRenderer = (
    { zodObject, field, control, className }: RenderProps & { zodObject: ZodIntegerObject }
) => {
    return (
        <>
            <Input
                {...field}
                className={className + ' w-1/2 ml-auto'}
                type="number"
                min={zodObject.minimum || zodObject.exclusiveMinimum}
                max={zodObject.maximum || zodObject.exclusiveMaximum}
                placeholder="INTEGER"
                step={0.1}
                size="xs"
            />
        </>
    )
}

export const arrayInputRender = (
    { zodObject, field, control, className, branch }: RenderProps & { zodObject: ZodArrayObject }
) => {
    if (field.name === 'identified_subjects') {
        return <IdentifiedSubjectsInput control={control} name={field.name} />
    }

    const { fields, append, remove } = useFieldArray({
        control,
        name: field.name
    });
    const store = getTreeStore()
    const firstRequiredProperty = zodObject.items.required[0]

    const onBranchAdd = (itemName: string) => {
        append({ firstRequiredProperty: itemName })
        
        // Delete the field used to actually add the field item in the array
        // example: "subject" string field for the subjects fields array 
        if (firstRequiredProperty in zodObject.items.properties ){
            delete zodObject.items.properties[firstRequiredProperty] 
        }
        
        // @ts-expect-error
        const valueObject = buildZodTree("value", zodObject.items.properties, [], false)

        const newDummyBranch: DummyTreeBranch = {
            isExpanded: true,
            data: {
                canBeDeleted: true,
                schema: {
                    type: "arrayItem"
                }
            },
            children: {
                ...valueObject["value"].children
            }
        }
        const {newBranch, allBranchesToBeAdded} = createInternalBranch(itemName, newDummyBranch, branch)
        store.getState().addInternalBranch({branch: newBranch})
    }



    return (
        <div className='flex flex-col gap-1'>
            <Input
                className={className + ' w-1/2 ml-auto'}
                placeholder={`ADD ITEM  (${firstRequiredProperty})`}
                size="xs"
                role="none"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const value = e.currentTarget.value;
                        if (!value) return;
                        
                        onBranchAdd(value)
                        e.currentTarget.value = ''; // clear input
                        e.preventDefault()
                    }
                }}
            />
        </div>
    )
}


export const dateRangeInputRenderer = ({ zodObject, field, control, className }: RenderProps) => {
    const { field: sinceField } = useController({
        name: "since",
        control,
    })

    const { field: untilField } = useController({
        name: "until",
        control,
    })

    const onRangeUpdate = useCallback(({ range }: { range: DateRange }) => {
        sinceField.onChange(range?.from ? new Date(range.from).toISOString() : undefined)
        untilField.onChange(range?.to ? new Date(range.to).toISOString() : undefined)
    }, [sinceField, untilField])

    return (
        <div className='w-auto ml-auto'>
            <DateRangePicker
                horizontal={true}
                onUpdate={onRangeUpdate}
                initialDateFrom={sinceField.value}
                initialDateTo={untilField.value}
            />
        </div>
    )
}

const IdentifiedSubjectsInput = ({ control, name }: { control: Control<any>, name: string }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name
    });

    return (
        <div className="space-y-2 w-full">
            <div className='text-xs text-neutral-400'>Add subjects and their stance.</div>
            {fields.map((item, index) => (
                <div key={item.id} className="flex flex-col items-center gap-2 p-2 border border-neutral-700">
                    <div className='flex flex-row justify-between w-full'>
                        <p className='text-neutral-200 font-roboto-mono'>Subject {index}</p>
                        <Button type="button" variant="destructive" size="xs" onClick={() => remove(index)}>
                            Remove
                        </Button>
                    </div>
                    <div className='flex justify-between w-full'>
                        <FormLabel className='w-[20px] font-sans text-neutral-400'>Subject Name</FormLabel>
                        <FormField
                            control={control}
                            name={`${name}.${index}.subject`}
                            render={({ field }) => (
                                <Input {...field} placeholder="Subject name" className="ml-auto w-[65%]" />
                            )}
                        />
                    </div>
                    <div className='flex justify-between w-full'>
                        <FormLabel className='font-sans text-neutral-400'>Min Stance</FormLabel>
                        <FormField
                            control={control}
                            name={`${name}.${index}.min_stance`}
                            render={({ field }) => (
                                <Input {...field} type="number" step="0.1" min="-1" max="1" placeholder="Min Stance" className="w-1/3" />
                            )}
                        />
                    </div>
                    <div className='flex justify-between w-full'>
                        <FormLabel className='font-sans text-neutral-400'>Max Stance</FormLabel>
                        <FormField
                            control={control}
                            name={`${name}.${index}.max_stance`}
                            render={({ field }) => (
                                <Input {...field} type="number" step="0.1" min="-1" max="1" placeholder="Max Stance" className="w-1/3" />
                            )}
                        />
                    </div>


                </div>
            ))}
            <Button
                type="button"
                variant="dashed1"
                size='xs'
                className='font-roboto-mono'
                onClick={() => append({ subject: '', min_stance: -1, max_stance: 1 })}
            >
                Add Subject
            </Button>
        </div>
    );
}

export interface RenderProps {
    zodObject: ZodPropertyObject,
    field: ControllerRenderProps,
    control: Control
    className?: string
    branch: InternalTreeBranch
}

export type INPUT_RENDERER_MAP_RETURN_TYPE = (
    props: RenderProps
) => React.ReactNode

export const INPUT_RENDERER_MAP = {
    "string": stringInputRenderer,
    "integer": integerInputRenderer,
    "number": integerInputRenderer,
    "array": arrayInputRender,
    "daterange": dateRangeInputRenderer
} as const as any as INPUT_RENDERER_MAP_RETURN_TYPE
