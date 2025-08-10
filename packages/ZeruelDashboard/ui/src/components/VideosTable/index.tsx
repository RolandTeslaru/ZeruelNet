import { fetchVideos } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { VideoQueryParams } from '@zeruel/dashboard-types'
import { Spinner } from '@zeruel/shared-ui/foundations'
import React, { memo } from 'react'
import JsonView from 'react18-json-view';

const VideosTable = memo(() => {

  const params: VideoQueryParams = {
    limit: 20,
    offset: 0,
    timestamp: "created_at",
    sort: "desc"
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["videos", params],
    queryFn: () => fetchVideos(params),
    staleTime: 30000
  })

  if (isLoading) return <Spinner/>
  if (isError) return <div>Errro</div>

  return (
    <div className='relative w-full h-full overflow-y-scroll !text-white text-[11px] font-mono'>
      <JsonView src={data}/>
      
    </div>
  )
})

export default VideosTable