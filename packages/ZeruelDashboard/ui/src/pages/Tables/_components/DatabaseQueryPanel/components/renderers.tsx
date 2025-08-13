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
import { ZodArrayObject, ZodIntegerObject, ZodStringObject } from "../types"

export const stringInputRenderer = (zodStringObject: ZodStringObject, field) => {
    if(zodStringObject.format === "date-time"){
        return <Input type="date"/>
    }
    if(Object.hasOwn(zodStringObject, "enum")){
        <Select>
            <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-hidden text-xs! text-white">
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {Object.keys(zodStringObject.enum).map((key) => (
                    <SelectItem key={key} value={key}>
                        {key}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    }
    return (
        <Input
            type='text'

        />
    )
}

export const integerInputRenderer = (zodIntegerObject: ZodIntegerObject, field) => {
    return (
        <Input
            type="number"
            min={zodIntegerObject.minimum || zodIntegerObject.exclusiveMinimum}
            max={zodIntegerObject.maximum || zodIntegerObject.exclusiveMaximum}
        />
    )
}

export const arrayInputRender = (zodArrayObject: ZodArrayObject, field) => {
    return (
        <></>
    )
}