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
    composedDataParams: TrendsAPI.ComposedData.Query
    dataBounds: {
        start_video_date: Date
        end_video_date: Date
    }
}

type Actions = {
    setComposedDataParams: (params: TrendsAPI.ComposedData.Query) => void
}

interface TrendsStoreInitialProps {
    initialDataBounds: { start_video_date: string; end_video_date: string }
}

export type TrendsStoreProps = State & Actions

const createTrendsStore = (props: TrendsStoreInitialProps) => {
    const { initialDataBounds } = props

    const start_video_date = initialDataBounds ? new Date(initialDataBounds.start_video_date) : new Date()
    const end_video_date = initialDataBounds ? new Date(initialDataBounds.end_video_date) : new Date()

    const slidingWindowEnd = new Date(Math.min(new Date().getTime(), end_video_date.getTime()))
    // 7 day window
    const slidingWindowStart = subDays(slidingWindowEnd, 40)

    return createStore<State & Actions>()(
        immer(
            (set, get) => ({
                composedDataParams: {
                    interval: "hour",
                    since: slidingWindowStart.toISOString(),
                    until: slidingWindowEnd.toISOString()
                },
                dataBounds: {
                    start_video_date: start_video_date,
                    end_video_date: end_video_date
                },
                setComposedDataParams: (params) => {
                    set(state => {
                        state.composedDataParams = {
                            ...state.composedDataParams,
                            ...params
                        }
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