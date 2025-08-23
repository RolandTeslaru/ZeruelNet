import React from 'react'
import { CrossesWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import { Spinner } from '@zeruel/shared-ui/foundations'
import { useActiveScraping } from "@/stores/useActiveScraping"
import { Bookmark, Heart, Share, Comment, ICON_MAP, Eye, Check, X } from '@zeruel/shared-ui/icons'
import classNames from 'classnames'
import { ScrapeSideMission, TiktokScrapedVideoMetadata } from '@zeruel/scraper-types'

interface Props {
  index: number
  scrapeSideMission: ScrapeSideMission
  metadata?: TiktokScrapedVideoMetadata
}

const success_text_classNames = 'absolute bottom-1/2 right-1/2 translate-1/2 text-green-300 text-center text-xl font-nippo tracking-wider animate-pulse'
const error_text_classNames = 'absolute bottom-1/2 right-1/2 translate-1/2 text-ref-300 text-center text-xl font-nippo tracking-wider animate-pulse'

const SideMissionWindow: React.FC<Props> = ({ index, scrapeSideMission }) => {

  // const metadata = null;
  const [metadata, status] = useActiveScraping(state => [
    state.videoMetadata[scrapeSideMission.url],
    state.jobStatus[scrapeSideMission.url] || "SCRAPING"
  ])

  return (
    <CrossesWindowStyling className={classNames(
      'transition-colors max-w-[200px] w-[200px] h-[300px] relative text-white font-roboto-mono',
      { "bg-green-700/10": status === "SUCCESS" },
      { "bg-red-600/10": status === "ERROR" }
    )
    }>
      <div className='absolute w-full h-full left-0 top-0 p-2'>
        <h4 className='text-white font-roboto-mono'>{`VIDEO_${index}`}</h4>
        <p className='text-xs text-white/30 font-roboto-mono'>{`SCRAPE_JOB_${index}`}</p>

        {status === "SCRAPING" &&
          <div className='absolute top-2 right-2 w-5 h-5'>
            <Spinner width={20} height={20} />
          </div>
        }
      </div>

      {status === "SUCCESS" &&
        <p className={success_text_classNames}>
          SUCCESS
        </p>
      }
      {status === "ERROR" &&
        <p className={error_text_classNames}>
          FAILED
        </p>
      }

      <div className={`relative w-full h-full transition-all ${(status === "SUCCESS" || status === "ERROR" ) && "opacity-10"}`}>
        {metadata ? <>
          <img
            className='w-full h-full opacity-50'
            src={metadata.thumbnail_url}
            alt={`Thumbnail for VIDEO_${index}`}
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
            }}
          />

          <p className='text-xs absolute bottom-4 left-1/2 -translate-x-1/2  text-nowrap animate-pulse text-white/60'>Scraping comments</p>
          <div className='absolute bottom-1/2 translate-y-1/2 w-full text-xs font-light flex flex-col gap-2'>
            <div className='flex flex-row gap-2'>
              <Heart size={18} />
              <p>{metadata.stats.likes_count}</p>
            </div>
            <div className='flex flex-row gap-2'>
              <Share size={18} />
              <p>{metadata.stats.share_count}</p>
            </div>
            <div className='flex flex-row gap-2'>
              <Comment size={18} />
              <p>{metadata.stats.comment_count}</p>
            </div>
            <div className='flex flex-row gap-2'>
              <Eye size={18} />
              <p>{metadata.stats.likes_count}</p>
            </div>
          </div>
        </> : <>

          <p className='text-xs absolute bottom-4 left-1/2 -translate-x-1/2  text-nowrap animate-pulse text-white/60'>Awaiting metadata</p>
        </>}
      </div>

    </CrossesWindowStyling>
  )
}

export default SideMissionWindow
