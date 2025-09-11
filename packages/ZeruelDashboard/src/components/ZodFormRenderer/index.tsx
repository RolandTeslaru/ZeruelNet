import React, { useImperativeHandle, useMemo, useRef } from 'react'
import { Control, ControllerRenderProps, UseFormReturn } from 'react-hook-form'
import { Button, Form, FormField, FormItem, FormLabel, FormMessage, } from '@zeruel/shared-ui/foundations'
import {z} from "zod"
import { ZodPropertyObject } from './types'
import { INPUT_RENDERER_MAP } from './inputRenderers'

interface Props {
    form: UseFormReturn
    onSubmit: (data: any) => void
    children?: React.ReactNode
    schema: z.ZodObject
    submitButtonTitle?: string
}

const ZodFormRenderer: React.FC<Props> = ({ form, onSubmit, children, schema, submitButtonTitle = "submit" }) => {

    const propertiesArray = useMemo(() => {
        return Object.entries(z.toJSONSchema(schema).properties)
    }, [schema])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-1'>
                {children}
                {propertiesArray.map(([key, zodObject]: [key: string, zodObject: ZodPropertyObject]) =>
                    <FormField
                        control={form.control}
                        key={key}
                        name={key}
                        render={({ field }) => (
                            <FormItem className='gap-1'>
                                <FormLabel className='font-sans text-neutral-400'>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</FormLabel>
                                <FormItem className='relative'>
                                    {INPUT_RENDERER_MAP[zodObject.type]?.({
                                        zodObject, 
                                        field, 
                                        control: form.control
                                    })}
                                </FormItem>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                )}
                <Button
                    variant="dashed1"
                    type="submit"
                    className='w-full border-blue-400/60 min-h-9 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono font text-xs mt-2'
                >
                    {submitButtonTitle}
                </Button>
            </form>
        </Form>
    )
}

export default ZodFormRenderer