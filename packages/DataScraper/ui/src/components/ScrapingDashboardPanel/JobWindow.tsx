import React from 'react'
import { CrossesWindowStyling } from '../../ui/components/VXWindow'
import { Spinner } from '../../ui/foundations'
import { ScrapeJob } from '@zeruel/scraper-types'

interface Props {
  index: number
  status: "SCRAPING" | "FINISHED" | "ERROR"
  job: ScrapeJob
}

const JobWindow: React.FC<Props> = ({index}) => {
  return (
      <CrossesWindowStyling className=' max-w-[200px] w-[200px] h-[300px] relative text-white font-roboto-mono'>
        <h4>{`VIDEO_${index}`}</h4>
        <p className='text-xs text-white/30'>{`SCRAPE_JOB_${index}`}</p>
        
        <div className='absolute top-2 right-2 w-5 h-5'>
          <Spinner width={20} height={20}/>
        </div>
       
      </CrossesWindowStyling>
  )
}

export default JobWindow