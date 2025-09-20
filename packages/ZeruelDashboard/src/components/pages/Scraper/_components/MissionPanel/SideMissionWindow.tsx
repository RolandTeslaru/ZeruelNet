import React from 'react'
import { CrossesWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import { Spinner } from '@zeruel/shared-ui/foundations'
import { useActiveScraping } from "@/stores/useActiveScraping"
import { Bookmark, Heart, Share, Comment, ICON_MAP, Eye, Check, X } from '@zeruel/shared-ui/icons'
import classNames from 'classnames'
import { ScraperAPI } from '@zeruel/scraper-types'

interface Props {
  index: number
  scrapeSideMission: ScraperAPI.Mission.SideMission
}

const success_text_classNames = 'absolute bottom-1/2 right-1/2 translate-1/2 text-green-300 text-center text-xl font-nippo tracking-wider animate-pulse'
const error_text_classNames = 'absolute bottom-1/2 right-1/2 translate-1/2 text-ref-300 text-center text-xl font-nippo tracking-wider animate-pulse'

const SideMissionWindow: React.FC<Props> = ({ index, scrapeSideMission }) => {

  const [metadata, status] = useActiveScraping(state => [
    state.videoMetadata[scrapeSideMission.url],
    state.jobStatus[scrapeSideMission.url] || "SCRAPING"
  ])

  return (
    <CrossesWindowStyling className={classNames(
      'transition-colors max-w-[200px] w-[200px] h-[300px] relative text-white font-roboto-mono !p-0',
      { "bg-green-700/10": status === "SUCCESS" },
      { "bg-red-600/10": status === "ERROR" }
    )
    }>

  


      <div className='absolute w-full h-full left-0 top-0 p-2'>
        {/* <h4 className='text-white font-roboto-mono'>{`VIDEO_${index}`}</h4> */}
        {/* <p className='text-xs text-white/30 font-roboto-mono'></p> */}

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

      <div className={`relative w-full h-full transition-all ${(status === "SUCCESS" || status === "ERROR") && "opacity-10"}`}>
        {metadata ? <>

    <img
        src={metadata.thumbnail_url}
        alt={"video thumbnail"}
        className='absolute z-0 w-full h-full opacity-50'
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        }}
      />

          <div className='absolute w-full top-1 h-[80px] overflow-hidden z-1 text-[11px] font-medium'>
            <div className='px-1'>
              <p className='text-white text-xs font-bold'>{metadata.author_username}</p>
              <p className='text-white/30'>{metadata.video_id}</p>
            </div>
          </div>

          <div className='absolute right-2 z-1 bottom-1/2 translate-y-1/2 w-fit text-xs font-roboto-mono font-medium text-center flex flex-col gap-1 text-white'>
            <div className='flex flex-col'>
              <Heart size={15} className='w-auto mx-auto text-red-400' />
              <p className='text-shadow-md text-shadow-black/20'>{formatNumber(metadata.stats.likes_count)}</p>
            </div>
            <div className='flex flex-col'>
              <Share size={15} className='w-auto mx-auto text-green-400' />
              <p className='text-shadow-md text-shadow-black/20'>{formatNumber(metadata.stats.share_count)}</p>
            </div>
            <div className='flex flex-col'>
              <Comment size={15} className='w-auto mx-auto text-orange-400' />
              <p className='text-shadow-md text-shadow-black/20'>{formatNumber(metadata.stats.comment_count)}</p>
            </div>
            <div className='flex flex-col'>
              <Eye size={15} className='w-auto mx-auto text-blue-400' />
              <p className='text-shadow-md text-shadow-black/20'>{formatNumber(metadata.stats.play_count)}</p>
            </div>
          </div>

          <p className='text-xs absolute bottom-4 left-1/2 -translate-x-1/2  text-nowrap animate-pulse text-white/60'>
            Scraping comments
          </p>

        </> : <>

          <p className='text-xs absolute bottom-4 left-1/2 -translate-x-1/2  text-nowrap animate-pulse text-white/60'>Awaiting metadata</p>
        </>}
      </div>

    </CrossesWindowStyling>
  )
}

export default SideMissionWindow


const formatNumber = (num: number): string => {
  const trim = (s: string) => s.replace(/\.0+$|([\.][0-9]*?)0+$/, '$1');

  if (num < 1000) return num.toString();

  if (num < 1_000_000) {
    const k = num / 1000;
    if (k >= 100) return `${Math.round(k)}K`;
    return `${trim(k.toFixed(2))}K`;
  }

  const m = num / 1_000_000;
  if (m >= 100) return `${Math.round(m)}M`;
  return `${trim(m.toFixed(2))}M`;
};
