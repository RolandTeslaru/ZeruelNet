import React from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'
import { useTrendsStore } from '../context'

const HashtagAlignmentChart = () => {
  
  const slidingWindow = useTrendsStore(state => state.slidingWindow)
  
  return (
    <div className='relative size-full'>
      <p className='text-sm absolute top-0 left-2 font-roboto-mono text-white/30'>
        Hashtag Alignment
      </p>

    </div>
  )
}

export default HashtagAlignmentChart