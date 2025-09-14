import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator'
import React from 'react'

interface Props {
    isLoading: boolean
    children: React.ReactNode
    data: any
}

const SafeData: React.FC<Props> = ({ isLoading, children, data }) => {
    if (isLoading)
        return <DataLoadingIndicator />
    else {
        if (!data) {
            return (
                <div className='abolute top-1/2 left-1/2 -translate-1/2'>
                    <p className='text-sm text-red-600 font-roboto-mono'>No Data</p>
                </div>
            )
        }
        return (
            <>
                {children}
            </>
        )
    }
}

export default SafeData