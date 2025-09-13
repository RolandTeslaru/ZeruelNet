import React, { memo } from 'react'
import JsonView from 'react18-json-view'
import { useTrendsStore } from '../context'

const StateVisualization = memo(() => {

    const state = useTrendsStore(state => state)

  return (
    <div className='text-xs'>
        <JsonView src={state}/>
    </div>
  )
})

export default StateVisualization