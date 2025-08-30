import { createStore, useStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';
import React, { createContext, memo, useContext, useMemo } from 'react';
import type { StoreApi } from 'zustand';
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import { shallow } from 'zustand/shallow';
import { useQuery } from '@tanstack/react-query';
import { subDays, differenceInMilliseconds } from 'date-fns';
import { fetchDataBounds } from '@/lib/api/trends';
import { TrendsAPI } from '@/types/api';

type State = {
    slidingWindow: {
        start: Date
        end: Date
        size: number
        bucketInterval: TrendsAPI.ComposedData.BucketInterval
    }
    dataBounds: {
        start_video_date: Date
        end_video_date: Date
    }
}

type Actions = {
    setSlidingWindowRange: (props: {start: Date, end:Date}) => void
    setSlidingWindowInterval: (value: TrendsAPI.ComposedData.BucketInterval) => void
}

interface TrendsStoreInitialProps {
    initialDataBounds: { start_video_date: string; end_video_date: string }
}

const createTrendsStore = (props: TrendsStoreInitialProps) => {

    console.log("Create Trends Store")

    const { initialDataBounds } = props

    const start_video_date = initialDataBounds ? new Date(initialDataBounds.start_video_date) : new Date()
    const end_video_date = initialDataBounds ? new Date(initialDataBounds.end_video_date) : new Date()

    const slidingWindowEnd = new Date(Math.min(new Date().getTime(), end_video_date.getTime()))
    // 7 day window
    const slidingWindowStart = subDays(slidingWindowEnd, 7)
    const slidingWindowSize = differenceInMilliseconds(slidingWindowEnd, slidingWindowStart)

    return createStore<State & Actions>()(
        immer(
            (set, get) => ({
                slidingWindow: {
                    start: slidingWindowStart,
                    end: slidingWindowEnd,
                    size: slidingWindowSize,
                    bucketInterval: "day"
                },
                dataBounds: {
                    start_video_date: start_video_date,
                    end_video_date: end_video_date
                },
                setSlidingWindowRange: ({start, end}) => {
                    set((state) => {
                        if(start)
                            state.slidingWindow.start = start;
                        if(end)
                            state.slidingWindow.end = end;

                        state.slidingWindow.size = differenceInMilliseconds(state.slidingWindow.end, state.slidingWindow.start)
                    });
                },
                setSlidingWindowInterval: (value) => {
                    set(state => {
                        state.slidingWindow.bucketInterval = value
                    })
                }
            })
        )
    )
}

const Context = createContext<StoreApi<State & Actions> | null>(null)

interface TreeProviderProps {
    children: React.ReactNode
}

export const TrendsProvider: React.FC<TreeProviderProps> = memo(({children}) => {
    
    const { data: initialDataBounds, isLoading } = useQuery({
        queryKey: ["trends", "data-bounds"],
        queryFn: async () => {
          const data = await fetchDataBounds();
          return data
        },
        retry: false, 
    })

    const value = useMemo(() => {
        return createTrendsStore({ initialDataBounds })
    },[initialDataBounds])

      
    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
})

export function useTrendsStore(): State & Actions;
export function useTrendsStore<T>(selector: (state: State & Actions) => T): T;
export function useTrendsStore<T>(selector?: (state: State & Actions) => T) {
    const store = useContext(Context);
    if (!store) throw new Error('Missing TrendsProvider in the tree');
    
    if (selector) {
        return useStoreWithEqualityFn(store, selector, shallow);
    }
    
    // Return entire state if no selector provided
    return useStoreWithEqualityFn(store, (state) => state, shallow);
};