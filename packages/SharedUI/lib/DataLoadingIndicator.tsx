import React from 'react'
import { Spinner } from './foundations'

interface Props {
    className?: string
    textClassName?: string
    title?: string
}

const DataLoadingIndicator: React.FC<Props> = ({ className, textClassName, title = "Fetching Data" }) => {
    return (
        <div className={'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 ' + className}>
            <p className={'font-roboto-mono font-medium animate-pulse h-auto my-auto ' + textClassName}>
                {title}
            </p>
            <Spinner />
        </div>
    )
}

export default DataLoadingIndicator