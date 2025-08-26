import { createStore, useStore } from 'zustand';
import React, { createContext, memo, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import { shallow } from 'zustand/shallow';
import { useQuery } from '@tanstack/react-query';
import { subDays, differenceInMilliseconds } from 'date-fns';

type State = {
    slidingWindow: {
        start: Date
        end: Date
        size: number
    }
    dataRange: {
        start_video_date: Date
        end_video_date: Date
    }
}

type Actions = {
    setSlidingWindow: (props: {start: Date, end:Date, size: number}) => void
    setDataRange: (start_video_date: Date, end_video_date: Date) => void
}

interface TrendsStoreInitialProps {
    initialDataRange?: { start_video_date: string; end_video_date: string }
}

const createTrendsStore = (props: TrendsStoreInitialProps = {}) => {

    const { initialDataRange } = props

    const end_video_date = initialDataRange ? new Date(initialDataRange.end_video_date) : new Date()
    const start_video_date = initialDataRange ? new Date(initialDataRange.start_video_date) : new Date()

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
                    size: slidingWindowSize
                },
                dataRange: {
                    start_video_date,
                    end_video_date
                },
                setSlidingWindow: ({start, end, size}) => {
                    set((state) => {
                        if(start)
                            state.slidingWindow.start = start;
                        if(end)
                            state.slidingWindow.end = end;
                        if(size)
                            state.slidingWindow.size = size
                    });
                },
                setDataRange: (start_video_date: Date, end_video_date: Date) => {
                    set((state) => {
                        state.dataRange.start_video_date = start_video_date;
                        state.dataRange.end_video_date = end_video_date;
                    });
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
    
    const dataRange = useQuery({
        queryKey: ["trends", "dataRange"],
        queryFn: async () => {
          const response = await fetch("/api/v1/trends/videos-volume-range");
          if (!response.ok) {
            throw new Error("Failed to fetch data range");
          }
          return response.json();
        }
    })
      
    return (
        <Context.Provider value={createTrendsStore({
            initialDataRange: dataRange.data
        })}>
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
        return useStore(store, selector);
    }
    
    // Return entire state if no selector provided
    return useStore(store, (state) => state);
};