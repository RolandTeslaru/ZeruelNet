import React from 'react'
import { useTrendsStore } from '../context'

const VideosPreview = () => {
  const composedDataParams = useTrendsStore(state => state.composedDataParams)

  return (
    <div className='size-full overflow-y-scroll grid'>VideosPreview</div>
  )
}

export default VideosPreview