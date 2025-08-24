import React, { useMemo } from 'react'
import { EnrichedVideoSchema, useEnrichmentViewer } from '../context'
import JsonView from 'react18-json-view'
// @ts-expect-error
import 'react18-json-view/src/style.css'
import { CrossesWindowStyling, CrossIcon } from '@zeruel/shared-ui/WindowStyling'
import { z } from "zod"
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'



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
                    <p>final_alignment</p>
                    <p>{parsedData.final_alignment}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>llm_overall_alignment</p>
                    <p>{parsedData.llm_overall_alignment}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>deterministic_alignment</p>
                    <p>{parsedData.deterministic_alignment}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>alignment_conflict</p>
                    <p>{parsedData.alignment_conflict}</p>
                </div>
            </CollapsiblePanel>
            

            <CollapsiblePanel title="Transcript" contentClassName='overflow-y-scroll gap-2'>
                <p className='text-neutral-100 text-xs font-roboto-mono'>{parsedData.transcript}</p>
            </CollapsiblePanel>
            
            
            <CollapsiblePanel title="Sentiment Analysis" contentClassName='overflow-y-scroll gap-2'>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>polarity:&nbsp;</p>
                    <p>{parsedData.polarity}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>text_sentiment_positive:&nbsp;</p>
                    <p>{parsedData.text_sentiment_positive}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>text_sentiment_negative:&nbsp;</p>
                    <p>{parsedData.text_sentiment_negative}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>text_sentiment_neutral:&nbsp;</p>
                    <p>{parsedData.text_sentiment_neutral}</p>
                </div>
            </CollapsiblePanel>
            
            
            <CollapsiblePanel title="LLM Analysis" contentClassName='overflow-y-scroll gap-2'>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>llm_model_name:&nbsp;</p>
                    <p>{parsedData.llm_model_name}</p>
                </div>
                <div className='text-xs font-roboto-mono flex text-white justify-between'>
                    <p>llm_overall_alignment:&nbsp;</p>
                    <p>{parsedData.llm_overall_alignment}</p>
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
                                    <p>stance: {obj.stance}</p>
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