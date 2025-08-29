import React from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { useTrendsStore } from '../context'
import { useQuery } from '@tanstack/react-query'
import { fetchSubjectsAlignment } from '@/lib/api/trends'
import JsonView from 'react18-json-view'
import { Spinner } from '@zeruel/shared-ui/foundations'
import ChartTooltip from '@zeruel/shared-ui/charts/sharedComponents/ChartTooltip'

const SubjectAlignmentChart = () => {

  const slidingWindow = useTrendsStore(state => state.slidingWindow)

  const { data, isLoading } = useQuery({
    queryKey: ['subjectsAlignment', { start: slidingWindow.start, end: slidingWindow.end }],
    queryFn: () => {
      return fetchSubjectsAlignment({
        since: slidingWindow.start.toISOString(),
        until: slidingWindow.end.toISOString()
      })
    }
  })

  const BAR_HEIGHT = 28;

  return (
    <div className='relative size-full text-xs'>
      <p className='text-sm text-center font-roboto-mono font-medium text-white/80'>
        LLM Identified Subjects Alignment
      </p>

      {isLoading ? <Spinner /> :
        <>
          <div className="w-full  max-h-full overflow-y-auto [&_*]:outline-none [&_*]:focus:outline-none">
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
                    <Cell key={`cell-${index}`} fill={entry.avg_stance >= 0 ? "oklch(79.2% 0.209 151.711)" : "oklch(70.4% 0.191 22.216)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* <JsonView src={data?.subjects} className='text-xs'/> */}
        </>

      }

    </div>
  )
}

export default SubjectAlignmentChart