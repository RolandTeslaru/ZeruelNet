import React, { useState } from 'react'
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';
import RotatingText from '../ui/components/RotatingText';
import { BracketsWindowStyling } from '../ui/components/VXWindow';
import { Stage } from '@zeruel/harvester-types';

const StagePanel = () => {
    const [textData, setTextData] = useState<Stage>({ title: 'IDLE:  AWAITING  TASK  WORK', type: 'INFO' });
  
    // Move messages outside useEffect so we can use them in render
    const messages: Stage[] = [
      { title: 'IDLE:  AWAITING  TASK  WORK', type: 'INFO' },
      { title: 'STAGE  1:  GATHERING  VIDEOS', type: 'TASK' },
      { title: 'STAGE  2:  SCRAPING  VIDEOS', type: 'TASK' },
      { title: 'STAGE  2:  ORGANISING  DATA', type: 'TASK' },
      { title: 'STAGE  3:  UPLOADING  TO  DATABASE', type: 'TASK' },
      { title: 'STAGE  4:  FINALISING', type: 'TASK' },
      { title: 'FINISHED:  SCRAPE  JOB  SUCCESSFUL', type: 'SUCCESS' },
      { title: 'ERROR:  SCRAPE  JOB  FAILED', type: 'FAILURE' },
    ];
  
    
  
    return (
      <div className='fixed flex flex-col gap-4 left-7 top-20 w-fit transition-all'>
        <BracketsWindowStyling className='mr-auto relative'>
          <RotatingText
            data={textData}
            mainClassName="text-2xl px-3 py-1 font-nippo font-light tracking-wider "
            staggerFrom={"first"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            rotationInterval={7000}
          />
        </BracketsWindowStyling>
        <div className='flex flex-col w-[250px] gap-4'>
         
        </div>
      </div>
    )
  }
  
export default StagePanel