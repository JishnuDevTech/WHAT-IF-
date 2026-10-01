import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'

export default function PopulationChart({ history }) {
  if (history.length < 2) return <p className="text-xs text-mist">Run the world to start its history.</p>
  return (
    <div className="h-14 w-44" aria-label="Population history">
      <ResponsiveContainer>
        <AreaChart data={history}>
          <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
          <Area dataKey="population" stroke="#6aa7e8" fill="#6aa7e8" fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
