import React, { memo, useCallback } from 'react'
import { useTrendsStore } from '../context'
import { TrendsAPI } from '@/types/api'
import { Form, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import ZodFromTreeRenderer from '@/components/ZodFormTreeRenderer'

const TimelineQueryPanel = memo(() => {
    const [composedDataParams, setComposedDataParams] = useTrendsStore(state => [
        state.composedDataParams, state.setComposedDataParams
    ])

    const form = useForm({
        resolver: zodResolver(TrendsAPI.ComposedData.Query),
        defaultValues: composedDataParams
    })

    return (
        <div className='h-auto overflow-y-scroll'>
            <ZodFromTreeRenderer
                // @ts-expect-error
                form={form}
                schema={TrendsAPI.ComposedData.Query}
                rootTreeName='Query'
                onSubmit={(data: TrendsAPI.ComposedData.Query) => {
                    setComposedDataParams(data);
                }}
                formDefaultValues={composedDataParams}
            />
        </div>
    )
})

export default TimelineQueryPanel