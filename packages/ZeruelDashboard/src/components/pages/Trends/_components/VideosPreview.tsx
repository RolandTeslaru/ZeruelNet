import React from 'react'
import { useTrendsStore } from '../context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchComposedData } from '@/lib/api/trends'
import SafeData from '@/components/SafeData'
import { ScraperAPI } from '@zeruel/scraper-types'
import { CrossesWindowStyling } from '@zeruel/shared-ui/WindowStyling'
import { AnimatePresence } from 'motion/react'
import { motion } from 'motion/react'
import { Bookmark, Heart, Share, Comment, ICON_MAP, Eye, Check, X, Info } from '@zeruel/shared-ui/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@zeruel/shared-ui/foundations'
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { TrendsAPI } from '@/types/api'

// Compact number formatter: 1.23K, 123K, 1.2M, 123M
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

const formatAlignment = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return "none";
  const formatted = num.toFixed(3); // Keep 3 decimal places initially
  // Remove trailing zeros and the decimal point if all are zeros after it
  const trimmed = formatted.replace(/\.?0+$/, '');
  return num >= 0 ? `+${trimmed}` : trimmed;
};

const VideosPreview = () => {
  const composedDataParams = useTrendsStore(state => state.composedDataParams)

  const { data, isLoading } = useQuery({
    queryKey: ['composed-data', JSON.stringify(composedDataParams)],
    queryFn: () => fetchComposedData(composedDataParams),
  });


  return (
    <SafeData isLoading={isLoading} data={data?.displayVideos} noDataTile='Null Response With The Current Query Params'>
      {(safeData) => (
        <div className='size-full overflow-y-scroll flex flex-wrap gap-6 p-4 '>
          <AnimatePresence mode='popLayout'>
            {safeData.map((video, index) => (
              <motion.div
                key={video.video_id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ ease: 'linear', duration: 0.2 }}
                className="w-auto mx-auto"
                layout
              >
                <VideoPreview video={video} key={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </SafeData>
  )
}

export default VideosPreview


interface VideoPreviewProps {
  video: TrendsAPI.ComposedData.DisplayItem
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video }) => {
  const { data: oEmbed, isFetching } = useQuery<{ thumbnail_url: string }>({
    queryKey: ["tiktok-oembed", video.video_id],
    enabled: true,
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(video.video_url)}`);
      if (!res.ok) throw new Error("Failed to fetch TikTok oEmbed");
      return res.json();
    },
  });

  const thumbnailSrc = oEmbed?.thumbnail_url;

  return (
    <CrossesWindowStyling
      className='transition-colors max-w-[200px] w-[200px] h-[300px] relative text-white font-roboto-mono !p-0'
    >
      <div className='absolute top-2 left-2 z-1 font-roboto-mono text-shadow-none'>
        <div className={`text-xs font-bold flex justify-between gap-2 
            ${video.final_alignment > 0.1 && video.final_alignment <= 1
            ? 'text-green-400' : video.final_alignment >= -0.1 && video.final_alignment <= 0.1
              ? 'text-white/80' : 'text-red-400'}`}
        >
          <p>ALIGNMENT</p>
          <div className='w-10'>
            <p>{formatAlignment(video.final_alignment)}</p>
          </div>
        </div>
        <div className={`text-xs font-semibold flex justify-between gap-2 
            ${video.llm_overall_alignment > 0.1 && video.llm_overall_alignment <= 1
            ? 'text-green-400' : video.llm_overall_alignment >= -0.1 && video.llm_overall_alignment <= 0.1
              ? 'text-white/80' : 'text-red-400'}`}
        >
          <p>LLM</p>
          <div className='w-10'>
            <p>{formatAlignment(video.llm_overall_alignment)}</p>

          </div>
        </div>
        <div className={`text-xs font-semibold flex justify-between gap-2 
            ${video.deterministic_alignment > 0.1 && video.deterministic_alignment <= 1
            ? 'text-green-400' : video.deterministic_alignment >= -0.1 && video.deterministic_alignment <= 0.1
              ? 'text-white/80' : 'text-red-400'}`}
        >
          <p>DET</p>
          <div className='w-10'>
            <p>{formatAlignment(video.deterministic_alignment)}</p>
          </div>
        </div>
      </div>

      <div className='absolute right-2 z-1 bottom-1/2 translate-y-1/2 w-fit text-xs font-roboto-mono font-medium text-center flex flex-col gap-1 text-white'>
        <div className='flex flex-col'>
          <Heart size={15} className='w-auto mx-auto text-red-400' />
          <p className='text-shadow-md text-shadow-black/20'>{formatNumber(video.likes_count)}</p>
        </div>
        <div className='flex flex-col'>
          <Share size={15} className='w-auto mx-auto text-green-400' />
          <p className='text-shadow-md text-shadow-black/20'>{formatNumber(video.share_count)}</p>
        </div>
        <div className='flex flex-col'>
          <Comment size={15} className='w-auto mx-auto text-orange-400' />
          <p className='text-shadow-md text-shadow-black/20'>{formatNumber(video.comment_count)}</p>
        </div>
        <div className='flex flex-col'>
          <Eye size={15} className='w-auto mx-auto text-blue-400' />
          <p className='text-shadow-md text-shadow-black/20'>{formatNumber(video.play_count)}</p>
        </div>
      </div>

      <div className='absolute w-full bottom-0 h-[80px] overflow-hidden z-1 text-[11px] font-medium'>
        <div className='px-1'>
          <p className='text-white text-xs font-bold'>{video.author_username}</p>
          <p className='text-white/30'>{video.video_id}</p>
          <p className='text-white/70 font-medium font-roboto-mono '>
            {video.video_description}
          </p>
        </div>
      </div>

      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={"video thumbnail"}
          className='absolute z-0 w-full h-full opacity-50'
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          }}
        />
      )}
    </CrossesWindowStyling>
  )
}