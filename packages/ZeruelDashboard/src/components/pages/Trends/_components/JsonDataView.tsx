import { fetchComposedData } from '@/lib/api/trends'
import { TrendsAPI } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTrendsStore } from '../context'
import JsonView from 'react18-json-view'

const JsonDataView = () => {
    const [slidingWindow] = useTrendsStore(state => [
        state.slidingWindow
    ])

    const { data, isLoading } = useQuery({
        queryKey: [
            'composed-data',
            slidingWindow.start.getTime(),
            slidingWindow.end.getTime(),
            slidingWindow.bucketInterval
        ],
        queryFn: () => {
            const query: TrendsAPI.ComposedData.Query = {
                interval: slidingWindow.bucketInterval,
                since: slidingWindow.start.toISOString(),
                until: slidingWindow.end.toISOString()
            }
            const data = fetchComposedData(query)
            return data
        }
    })

    return (
        <div className='size-full overflow-scroll text-xs'>
            <JsonView src={data}/>
        </div>
    )
}

export default JsonDataView