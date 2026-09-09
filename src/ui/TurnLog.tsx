import { BUILDINGS, TECHS, type GameEvent } from '../engine'

interface Props {
  events: GameEvent[]
}

function formatEvent(event: GameEvent): string {
  switch (event.type) {
    case 'yields':
      return `Yields: food +${event.yields.food}, prod +${event.yields.production}, gold +${event.yields.gold}, sci +${event.yields.science}`
    case 'grew':
      return `City grew to population ${event.population}`
    case 'starved':
      return `Starvation — population now ${event.population}`
    case 'buildingComplete':
      return `Completed ${BUILDINGS[event.buildingId].name}`
    case 'buildingProgress':
      return `Building ${BUILDINGS[event.buildingId].name}: ${event.progress}/${event.cost}`
    case 'researchComplete':
      return `Discovered ${TECHS[event.techId].name}`
    case 'researchProgress':
      return `Research ${TECHS[event.techId].name}: ${event.progress}/${event.cost}`
    case 'victory':
      return `Victory via ${TECHS[event.techId].name}`
    case 'turnEnded':
      return `Turn ${event.turn} begins`
    default: {
      const _exhaustive: never = event
      return _exhaustive
    }
  }
}

export function TurnLog({ events }: Props) {
  return (
    <section className="panel log">
      <h2>Last turn</h2>
      {events.length === 0 ? (
        <p className="muted">End a turn to see the report.</p>
      ) : (
        <ul>
          {events.map((event, i) => (
            <li key={`${event.type}-${i}`}>{formatEvent(event)}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
