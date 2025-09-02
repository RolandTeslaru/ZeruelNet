import React, { memo } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { useTrendsStore } from '../context'
import { useQuery } from '@tanstack/react-query'
import { fetchSujects } from '@/lib/api/trends'
import JsonView from 'react18-json-view'
import { Spinner } from '@zeruel/shared-ui/foundations'
import ChartTooltip from '@zeruel/shared-ui/charts/sharedComponents/ChartTooltip'
import DataLoadingIndicator from "@zeruel/shared-ui/DataLoadingIndicator"

const SubjectAlignmentChart = memo(() => {

  const [start, end] = useTrendsStore(state => [state.slidingWindow.start, state.slidingWindow.end])

  const { data, isLoading } = useQuery({
    queryKey: [
      'subjectsAlignment',
      start.toISOString(),
      end.toISOString()
    ],
    queryFn: () => {
      return fetchSujects({
        since: start.toISOString(),
        until: end.toISOString()
        // include_knowledge defaults to false, so we don't need to pass it
      })
    }
  })

  const BAR_HEIGHT = 28;

  return (
    <>
      {isLoading ? <DataLoadingIndicator /> :
        <>
          <div className="[&_*]:outline-none [&_*]:focus:outline-none">
            <ResponsiveContainer
              height={data.subjects.length * BAR_HEIGHT}
              width={"100%"}
            >
              <BarChart
                layout="vertical"
                data={data.subjects}
              >
                {/* Numeric stance on X axis (-1 to 1) */}
                <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 10 }} />
                {/* Subject names on Y axis */}
                <YAxis
                  dataKey="subject_name"
                  type="category"
                  width={140}
                  tick={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    fill: '#a3a3a3',
                    textAnchor: 'end'
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      payload={payload?.map(item => ({
                        category: "Alignment",
                        value: item.value as number,
                        index: item.dataKey as string,
                        color: "blue" as any, // You can map this to your color logic
                        payload: item.payload
                      })) || []}
                      label={label as string}
                      valueFormatter={(value) => value.toFixed(3)}
                    />
                  )}
                />
                <ReferenceLine x={0} stroke="#94a3b8" />

                <Bar dataKey="avg_stance" isAnimationActive={false} barSize={BAR_HEIGHT - 4}>
                  {data.subjects.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.avg_stance >= 0 ? "url(#barGreenHorizontal)" : "url(#barRedHorizontal)"} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGreenHorizontal" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(79.2% 0.209 151.711)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="oklch(79.2% 0.209 151.711)" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barRedHorizontal" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="oklch(63.7% 0.237 25.331)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="oklch(63.7% 0.237 25.331)" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* <JsonView src={data?.subjects} className='text-xs'/> */}
        </>

      }
    
    </>
  )
})

export default SubjectAlignmentChart