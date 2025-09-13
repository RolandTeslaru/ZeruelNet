import React, { memo, useMemo } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { useTrendsStore } from '../context'
import { useQuery } from '@tanstack/react-query'
import { fetchSujects } from '@/lib/api/trends'
import JsonView from 'react18-json-view'
import { Spinner } from '@zeruel/shared-ui/foundations'
import ChartTooltip from '@zeruel/shared-ui/charts/sharedComponents/ChartTooltip'
import DataLoadingIndicator from "@zeruel/shared-ui/DataLoadingIndicator"
import { useRef, useLayoutEffect, useState } from 'react';
import Search from '@zeruel/shared-ui/Search'
import { el } from 'date-fns/locale'
import SafeData from '@/components/SafeData'

const SubjectAlignmentChart = memo(() => {

  const [start, end] = useTrendsStore(state => [
    state.composedDataParams.since,
    state.composedDataParams.until
  ])

  const { data, isLoading } = useQuery({
    queryKey: [
      'subjectsAlignment',
      start,
      end
    ],
    queryFn: () => {
      return fetchSujects({
        since: start,
        until: end
        // include_knowledge defaults to false, so we don't need to pass it
      })
    }
  })

  const [searchQuery, setSearchQuery] = useState<string | null>(null)

  const filteredSubjects = useMemo(() => {
    if (data?.subjects)
      if (searchQuery)
        return data.subjects.filter(s => s.subject_name.includes(searchQuery))
      else return data.subjects
    else
      return []
  }, [searchQuery, data?.subjects])

  return (
    <SafeData isLoading={isLoading}>
      <div className='flex flex-row w-full justify-between'>
        <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} className='w-30' />

        <p className='text-[11px] font-roboto-mono'>
          {searchQuery && searchQuery.length > 0 ?
            `found ${filteredSubjects.length} subjects`
            :
            `${data?.subjects.length} subjects`
          }
        </p>

      </div>

      <div className='flex flex-col gap-1'>
        {filteredSubjects.map(subject =>
          <div key={subject.subject_name} className='flex flex-row justify-between gap-1 px-1 h-6 w-full '>
            <TitleVisualizer text={subject.subject_name} />

            <div className='flex flex-row gap-1'>
              <RangeNumberVisualizer value={subject.avg_stance} />
              <RangeNumberVisualizer value={subject.avg_alignment_score} />
              <RangeNumberVisualizer value={subject.expect_alignment} />
              <BinaryNumberVisualizer value={subject.total_mentions} max={data.meta.max_total_mentions} />
            </div>
          </div>
        )}

      </div>
    </SafeData>
  )
})

export default SubjectAlignmentChart

const valueFormatter = (value: number) => {
  if (Number.isInteger(value)) {
    return value;
  }
  const [integerPart, decimalPart] = value.toString().split('.');
  if (decimalPart && decimalPart.length > 2) {
    return parseFloat(value.toFixed(2));
  }
  return value;
}

const TitleVisualizer = memo(({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const txt = textRef.current;
    if (!container || !txt) return;
    const containerW = container.clientWidth;
    const textW = txt.scrollWidth;
    if (textW > containerW) {
      setNeedsScroll(true);
      setDistance(textW - containerW);
    }
  }, [text]);

  return (
    <div
      ref={containerRef}
      className='my-auto h-auto max-w-30 overflow-hidden'
    >
      <p
        ref={textRef}
        style={needsScroll ? {
          // custom CSS var for distance
          // @ts-ignore
          '--scroll-distance': `${distance}px`,
        } as React.CSSProperties : undefined}
        className={`text-nowrap text-white/50 font-roboto-mono text-[11px] antialiased font-medium ${needsScroll ? 'marquee' : ''}`}
      >
        {text}
      </p>
    </div>
  )
})

const RangeNumberVisualizer = memo(({ value }: { value: number }) => {
  return (
    <div className={`h-full w-10 flex`}
      style={{
        backgroundColor: value > 0
          ? `oklch(79.2% 0.209 151.711 / ${value * 80}%)` // green-400
          : `oklch(57.7% 0.245 27.325 / ${Math.abs(value) * 80}%)` // red-600 
      }}
    >
      <p className='h-auto my-auto w-auto mx-auto text-white/90 text-xs font-roboto-mono font-bold'>
        {valueFormatter(value)}
      </p>
    </div>
  )
})

const BinaryNumberVisualizer = memo(({ value, max }: { value: number, max: number }) => {
  return (
    <div className={`h-full w-10 flex`}
      style={{
        backgroundColor: `oklch(74.6% 0.16 232.661 / ${value / max * 80}%)`
      }}
    >
      <p className='h-auto my-auto w-auto mx-auto text-white/90 text-xs font-roboto-mono font-bold'>
        {valueFormatter(value)}
      </p>
    </div>
  )
})