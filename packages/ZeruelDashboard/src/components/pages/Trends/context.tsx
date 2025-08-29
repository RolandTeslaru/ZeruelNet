import { createStore, useStore } from 'zustand';
import React, { createContext, memo, useContext } from 'react';
import type { StoreApi } from 'zustand';
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import { shallow } from 'zustand/shallow';
import { useQuery } from '@tanstack/react-query';
import { subDays, differenceInMilliseconds } from 'date-fns';
import { fetchDataBounds } from '@/lib/api/trends';

type State = {
    slidingWindow: {
        start: Date
        end: Date
        size: number
    }
    dataBounds: {
        start_video_date: Date
        end_video_date: Date
    }
}

type Actions = {
    setSlidingWindow: (props: {start: Date, end:Date, size: number}) => void
}

interface TrendsStoreInitialProps {
    initialDataBounds: { start_video_date: string; end_video_date: string }
}

const createTrendsStore = (props: TrendsStoreInitialProps) => {

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
                    size: slidingWindowSize
                },
                dataBounds: {
                    start_video_date: start_video_date,
                    end_video_date: end_video_date
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
            
            console.log("INITIAL DATA BOUNDS ",data)

          return data
        },
        retry: false, 
    })

      
    return (
        <Context.Provider value={createTrendsStore({ initialDataBounds })}>
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