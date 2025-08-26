import React from 'react'
import JsonView from 'react18-json-view'
import { useTrendsStore } from '../context'

const StateVisualization = () => {

    const state = useTrendsStore()

  return (
    <div className='text-xs'>
        <JsonView src={state}/>
    </div>
  )
}

export default StateVisualization