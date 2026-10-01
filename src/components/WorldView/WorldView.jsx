import Town from './Town'
import Person from './Person'
import { DayNight, Weather, EventMarkers } from './Overlays'

export default function WorldView({ world, agents, hour }) {
  const built = Math.max(3, Math.ceil((world.resources.housing / 100) * 12))
  const sorted = [...agents].sort((a, b) => a.y - b.y)
  return (
    <svg viewBox="-70 -45 1340 790" className="h-full w-full drop-shadow-[0_24px_60px_rgba(0,0,0,.28)]" role="img" aria-label={`A town of ${world.population} people, ${agents.length} shown`}>
      <Town r={world.resources} built={built} roads={world.roads} traffic={world.traffic} pollution={world.pollution} emergencyResponse={world.emergencyResponse} cars={world.policies?.cars !== false} health={world.health} farmHealth={world.farmHealth} schoolActivity={world.schoolActivity} gymActivity={world.gymActivity} businessActivity={world.businessActivity} schoolsClosed={world.policies?.schoolsClosed} critical={world.critical} />
      <g>{sorted.map((a) => <Person key={a.id} a={a} />)}</g>
      <DayNight hour={hour} r={world.resources} built={built} critical={world.critical} />
      <Weather weather={world.weather} />
      <EventMarkers events={world.activeEvents} />
    </svg>
  )
}
