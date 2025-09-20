import React, { memo } from 'react'
import SideMissionWindow from './SideMissionWindow'
import { AnimatePresence, scale } from 'motion/react'
import { motion } from 'motion/react'
import { useActiveScraping } from '@/stores/useActiveScraping'



const MissionPanel = memo(() => {

  const activeScraping = useActiveScraping(state => state.activeScraping)

  return (
    <div className='relative max-h-[80vh] gap-4 p-2  flex flex-col overflow-y-scroll !overflow-x-visible'>
      <p className='text-white/20 font-nippo text-xl font-meidum'>
        ACTIVE  SCRAPE  MISSION  PANEL
      </p>
      <div className='flex flex-wrap gap-4'>
        <AnimatePresence mode="popLayout">
          {/* <motion.div
            key={demo_data.sideMission.url} // Using a unique and stable key like jobUrl is important!
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }} // Add the exit prop for the outro animation
            transition={{ ease: 'linear', duration: 0.2 }}
            className="w-auto mx-auto"
            layout
          >
            <SideMissionWindow index={1} scrapeSideMission={demo_data.sideMission} metadata={demo_data.metadata} />
          </motion.div> */}
          {Array.from(activeScraping).map(([scrapeUrl, sideMission], index) => (
            <motion.div
              key={scrapeUrl} // stable key
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ ease: 'linear', duration: 0.2 }}
              className="w-auto mx-auto"
              layout
            >
              <SideMissionWindow index={index} scrapeSideMission={sideMission}/>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </div>
  )
})

export default MissionPanel


const demo_data = {
  sideMission: {
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
