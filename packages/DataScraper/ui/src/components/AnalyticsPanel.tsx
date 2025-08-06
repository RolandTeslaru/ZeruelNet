import React from 'react'
import { BracketsWindowStyling } from '@zeruel/shared-ui/VXWindow'
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';

const trafficData = [
    { hour: "00", incoming: 1200, outgoing: 800, blocked: 45 },
    { hour: "04", incoming: 800, outgoing: 600, blocked: 23 },
    { hour: "08", incoming: 2400, outgoing: 1800, blocked: 67 },
    { hour: "12", incoming: 3200, outgoing: 2400, blocked: 89 },
    { hour: "16", incoming: 2800, outgoing: 2100, blocked: 76 },
    { hour: "20", incoming: 1800, outgoing: 1200, blocked: 54 },
  ]

const AnalyticsPanel = () => {
    return (
        <BracketsWindowStyling className='w-full mr-auto relative'>
            <div className='h-[150px]'>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -25, bottom: -5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="hour" stroke="#ffffff60" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff60" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                        <Area type="monotone" dataKey="incoming" stackId="1" stroke="#3b82f6" fill="#3b82f650" />
                        <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#10b981" fill="#10b98150" />
                        <Area type="monotone" dataKey="blocked" stackId="2" stroke="#ef4444" fill="#ef444450" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </BracketsWindowStyling>
    )
}

export default AnalyticsPanel