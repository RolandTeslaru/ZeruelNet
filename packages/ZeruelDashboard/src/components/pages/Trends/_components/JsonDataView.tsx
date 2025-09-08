import { fetchComposedData } from '@/lib/api/trends'
import { TrendsAPI } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTrendsStore } from '../context'
import JsonView from 'react18-json-view'

const JsonDataView = () => {
    const composedDataParams = useTrendsStore(state => state.composedDataParams)

    const { data, isLoading } = useQuery({
        queryKey: [
            'composed-data',
            JSON.stringify(composedDataParams)
        ],
        queryFn: () => {
            const data = fetchComposedData(composedDataParams)
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