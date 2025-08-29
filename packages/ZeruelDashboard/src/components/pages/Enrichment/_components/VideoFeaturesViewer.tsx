import React, { useMemo } from 'react'
import JsonView from 'react18-json-view'
// @ts-expect-error
import 'react18-json-view/src/style.css'
import { CrossesWindowStyling, CrossIcon } from '@zeruel/shared-ui/WindowStyling'
import { z } from "zod"
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { useEnrichmentViewer } from '../context'
import { EnrichedVideoSchema } from '@/types/enrichedVideo'



const VideoFeaturesViewer = () => {
    const { selectedVideoId, selectedVideoData } = useEnrichmentViewer()

    const parsedData = useMemo(() => {
        if(!selectedVideoData)
            return null
        
        const result = EnrichedVideoSchema.safeParse(selectedVideoData)
        if (result.success)
            return result.data
        else if(result.error){
            console.log("Result Error ", z.treeifyError(result.error))
            return null
        }
    }, [selectedVideoData, selectedVideoId])

    if (!parsedData) return null

    return (
        <div className='relative flex flex-col gap-4 overflow-y-scroll px-2 py-2'>
            
            
            <CrossesWindowStyling className='bg-black/20'>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>video_id:</p>
                    <p>{parsedData.video_id}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>detected_language:</p>
                    <p>{parsedData.detected_language}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>last_enriched_at:</p>
                    <p>{parsedData.last_enriched_at}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>total_count</p>
                    <p>{parsedData.total_count}</p>
                </div>
            </CrossesWindowStyling>
            
            <CollapsiblePanel title="Alignment" contentClassName='overflow-y-scroll gap-2'>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='final_alignment' value={parsedData.final_alignment}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='llm_overall_alignment' value={parsedData.llm_overall_alignment}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='deterministic_alignment' value={parsedData.deterministic_alignment}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='alignment_conflict' value={parsedData.alignment_conflict}/>
                </div>
            </CollapsiblePanel>
            

            <CollapsiblePanel title="Transcript" contentClassName='overflow-y-scroll gap-2'>
                <p className='text-neutral-100 text-xs font-roboto-mono'>{parsedData.transcript}</p>
            </CollapsiblePanel>
            
            
            <CollapsiblePanel title="Sentiment Analysis" contentClassName='overflow-y-scroll gap-2'>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='polarity' value={parsedData.polarity}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='text_sentiment_positive' value={parsedData.text_sentiment_positive}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='text_sentiment_negative' value={parsedData.text_sentiment_negative}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='text_sentiment_neutral' value={parsedData.text_sentiment_neutral}/>
                </div>
            </CollapsiblePanel>
            
            
            <CollapsiblePanel title="LLM Analysis" contentClassName='overflow-y-scroll gap-2'>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>llm_model_name:&nbsp;</p>
                    <p>{parsedData.llm_model_name}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <NumberSignValueNode title='llm_overall_alignment' value={parsedData.llm_overall_alignment}/>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>llm_summary:&nbsp;</p>
                    <p>{parsedData.llm_summary}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>llm_identified_subjects:&nbsp;</p>
                    <div className='w-full flex flex-col'>
                        <div className='relative border border-white/20 '>
                            <CrossIcon className={"absolute h-3 w-3 top-0 left-0 transform -translate-x-1/2 -translate-y-1/2"} />
                            <CrossIcon className={"absolute h-3 w-3 top-0 right-0 transform translate-x-1/2 -translate-y-1/2"} />
                            <CrossIcon className={"absolute h-3 w-3 bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2"} />
                            <CrossIcon className={"absolute h-3 w-3 bottom-0 right-0 transform translate-x-1/2 translate-y-1/2"} />
                            {parsedData.llm_identified_subjects.map((obj, index) => (
                                <div key={index} className={`relative px-1 py-3 flex justify-between ${index !== 0 && selectedVideoData.llm_identified_subjects.length - 1 !== 0 && "border-t border-white/20"}`}>
                                    <p>subject: {obj.subject}</p>
                                    <div className='flex flex-col'>
                                        <NumberSignValueNode title='stance' value={obj.stance}/>
                                        <NumberSignValueNode title='alingment_score' value={obj.alignment_score}/>
                                        <NumberSignValueNode title='expected_alignment' value={obj.expected_alignment}/>
                                        <NumberSignValueNode title='alignment_gap' value={obj.alignment_gap}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CollapsiblePanel>


            <CollapsiblePanel title="JSON Data" contentClassName='overflow-y-scroll'>
                <JsonView src={parsedData} />
            </CollapsiblePanel>
        </div>
    )
}

export default VideoFeaturesViewer


const NumberSignValueNode = ({title, value}: {title: string, value: number}) => {
    const formatValue = (val: number) => {
        if (val > 0) {
            return `+${val.toFixed(2)}`;
        }
        return val.toFixed(2);
    };

    const getColorClass = (val: number) => {
        if (val > 0) return "text-green-400";
        if (val < 0) return "text-red-400";
        return "text-cyan-400";
    };

    return (
        <div className='flex flex-row w-full justify-between gap-1'>
            <p>{title}:</p>
            <p className={getColorClass(value)}>{formatValue(value)}</p>
        </div>
    )
}