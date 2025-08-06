import React from 'react'
import JobWindow from './JobWindow'
import { AnimatePresence, scale } from 'motion/react'
import { motion } from 'motion/react'
import { useActiveJobFeed } from '../../stores/useActiveJobFeed'
import { ScrapeJob, T_VideoMetadata } from '@zeruel/scraper-types'



const demo_data: { job: ScrapeJob, metadata: T_VideoMetadata } = {
  job: {
    platform: "tiktok",
    url: "https://www.tiktok.com/@voceapoporuluimeu/video/7532256645603151126",
    parent_task: {
      source: "hashtag",
      identifier: "russia",
      limit: 10
    },
    scrape_policy: "full"
  },
  metadata: {
    platform: "tiktok",
    video_id: "7532256645603151126",
    video_url: "https://www.tiktok.com/@voceapoporuluimeu/video/7532256645603151126",
    thumbnail_url:"https://p16-pu-sign-no.tiktokcdn-eu.com/tos-no1a-p-0037-no/oAkDNSHrESFBIqFgogpAwAgfLH5RBpEiKIFyeY~tplv-tiktokx-dmt-logom:tos-no1a-i-0068-no/oAEEKFo5gCAGFKDSIfduAkAgEQAeEilkFCKARq.image?dr=10393&x-expires=1754089200&x-signature=wwVD%2FMSCnTmNHynnde3V00wswpk%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=no1a",
    author_username: "username",
    video_description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia quibusdam quas, architecto quasi repellendus molestiae accusamus quae et beatae excepturi laudantium rerum, numquam nobis, sit omnis cumque facere itaque aspernatur?",
    extracted_hashtags: ["suveranitate", "rusia", "calin gerogescu"],
    stats: {
      likes_count: 4000,
      share_count: 76,
      comment_count: 32,
      play_count: 123
    }
  }
}



const ScrapingDashboard = () => {

  const activeJobs = useActiveJobFeed(state => state.activeJobs)

  return (
    <div className='relative max-h-[80vh] gap-6 p-2 flex flex-wrap mt-2 overflow-y-scroll !overflow-x-visible'>
      <AnimatePresence mode="popLayout">
        {/* <motion.div
          key={demo_data.job.url} // Using a unique and stable key like jobUrl is important!
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }} // Add the exit prop for the outro animation
          transition={{ ease: 'linear', duration: 0.2 }}
          className="w-auto mx-auto"
          layout
        >
          <JobWindow index={0} job={demo_data.job} metadata={demo_data.metadata} status="SCRAPING" />
        </motion.div> */}
        {Array.from(activeJobs).map(([jobUrl, job], index) => (
          <motion.div
            key={jobUrl} // stable key
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ ease: 'linear', duration: 0.2 }}
            className="w-auto mx-auto"
            layout
          >
            <JobWindow index={index} job={job}/>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ScrapingDashboard