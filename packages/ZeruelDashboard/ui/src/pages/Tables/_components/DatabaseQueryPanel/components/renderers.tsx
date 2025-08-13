import {
    Form, // Added Form provider
    FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
    Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
    DualRangeSlider,
    Slider,
    Calendar,
    Popover, PopoverTrigger, PopoverContent,
    Button,
    ContextMenuTrigger,
} from '@zeruel/shared-ui/foundations'
import { ZodArrayObject, ZodIntegerObject, ZodStringObject } from "../types"
import { ControllerRenderProps } from "react-hook-form";
import { useEffect } from 'react';
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper';

export const stringInputRenderer = (zodStringObject: ZodStringObject, field: ControllerRenderProps) => {
    if (zodStringObject.format === "date-time") {
        return (
            <Input
                type="date"
                className='w-1/2 ml-auto'
                defaultValue={field.value}
            />
        )
    }
    if (zodStringObject.enum) {
        return (
            <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
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
            type='text'
            className='w-1/2 ml-auto'
            placeholder='STRING'
        />
    )
}

export const integerInputRenderer = (zodIntegerObject: ZodIntegerObject, field: ControllerRenderProps) => {
    return (
        <Input
            className='w-1/2 ml-auto'
            type="number"
            defaultValue={field.value}
            min={zodIntegerObject.minimum || zodIntegerObject.exclusiveMinimum}
            max={zodIntegerObject.maximum || zodIntegerObject.exclusiveMaximum}
            placeholder="INTEGER"
        />
    )
}

export const arrayInputRender = (zodArrayObject: ZodArrayObject, field: ControllerRenderProps) => {
    return (
        <>
        </>
    )
}