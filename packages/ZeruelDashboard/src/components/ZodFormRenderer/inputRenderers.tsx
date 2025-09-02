import {
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Button,
} from '@zeruel/shared-ui/foundations'
import { ZodArrayObject, ZodIntegerObject, ZodPropertyObject, ZodStringObject } from "./types"
import { Control, ControllerRenderProps, useFieldArray } from "react-hook-form";

export const stringInputRenderer = (zodStringObject: ZodStringObject, field: ControllerRenderProps, control: Control, className?: string) => {
    if (zodStringObject.format === "date-time") {
        return (
            <Input
                {...field}
                type="date"
                className={className + ' w-1/2 ml-auto'}
                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            />
        )
    }
    if (zodStringObject.enum) {
        return (
            <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? zodStringObject.default}
            >
                <SelectTrigger className="w-1/2 ml-auto focus:outline-hidden text-xs!">
                    <SelectValue placeholder="ENUM" className={field.value ? "text-white" : "text-neutral-200"} />
                </SelectTrigger>
                <SelectContent>
                    {zodStringObject.enum.map((value) => (
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
        />
    )
}

export const integerInputRenderer = (zodIntegerObject: ZodIntegerObject, field: ControllerRenderProps, control: Control, className?: string) => {
    return (
        <>
            <Input
                {...field}
                className={className + ' w-1/2 ml-auto'}
                type="number"
                min={zodIntegerObject.minimum || zodIntegerObject.exclusiveMinimum}
                max={zodIntegerObject.maximum || zodIntegerObject.exclusiveMaximum}
                placeholder="INTEGER"
            />
        </>
    )
}

export const arrayInputRender = (zodArrayObject: ZodArrayObject, field: ControllerRenderProps, control: Control) => {
    if (field.name === 'identified_subjects') {
        return <IdentifiedSubjectsInput control={control} name={field.name} />
    }
    return (
        <>
        </>
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

export type INPUT_RENDERER_MAP_RETURN_TYPE = (
    zodProp: ZodPropertyObject,
    field: ControllerRenderProps,
    control: Control
) => React.ReactNode

export const INPUT_RENDERER_MAP = {
    "string": stringInputRenderer,
    "integer": integerInputRenderer,
    "number": integerInputRenderer,
    "array": arrayInputRender
} as const as any as INPUT_RENDERER_MAP_RETURN_TYPE
