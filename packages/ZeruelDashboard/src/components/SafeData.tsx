import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator'
import React from 'react'

interface Props {
    isLoading: boolean
    children: React.ReactNode
}

const SafeData: React.FC<Props> = ({isLoading, children}) => {
    if(isLoading)
        return <DataLoadingIndicator/>
    else
        return (
    <>
        {children}
    </>
    )
}

export default SafeData