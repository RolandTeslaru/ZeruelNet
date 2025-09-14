import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator'
import React from 'react'

interface Props<T> {
    isLoading: boolean
    children: (data: T) => React.ReactNode
    data: T | null | undefined
    noDataTile?: string
}

const SafeData = <T,>({ isLoading = true, children, data, noDataTile }: Props<T>) => {
    if (isLoading) {
        return <DataLoadingIndicator />;
    }
    
    if (data === null || data === undefined) {
        return (
            <div className="size-full min-h-10 min-w-10 relative">
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2'>
                    <p className='text-sm text-red-600 font-roboto-mono animate-pulse'>{noDataTile ?? "No Data"}</p>
                </div>
            </div>
        );
    }

    // Now we call the children function, passing the safe data to it.
    return <>{children(data)}</>;
}


export default SafeData