import React from 'react'
import { CrossesWindowStyling } from '../../ui/components/VXWindow'
import TabWindow from './TabWindow'
import { AnimatePresence, scale } from 'motion/react'
import { motion } from 'motion/react'

const ScrapingDashboard = () => {
  return (
    <div className='relative max-h-[80vh] gap-6 p-2 flex flex-wrap mt-2 overflow-y-scroll !overflow-x-visible'>
      {Array(10).fill("da").map((_, index) =>
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: "linear", delay: index * 0.1 }} // Add delay based on index
          className='w-auto mx-auto'
          key={index}
        >
          <TabWindow index={index} status="SCRAPING"/>
        </motion.div>
      )} 
    </div>
  )
}

export default ScrapingDashboard