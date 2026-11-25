import { GameIcon, ProgressMeter } from './GameIcon'
import { computeYields, canQueueBuilding, TECHS } from '../engine'
import {
  BUILDING_ORDER,
  BUILDINGS,
  type BuildingId,
  type Focus,
  type GameState,
} from '../engine'

const FOCUSES: Focus[] = ['food', 'production', 'gold', 'science']

interface Props {
  state: GameState
  growthNeed: number
  onSetFocus: (focus: Focus) => void
  onQueueBuilding: (buildingId: BuildingId) => void
}

export function CityPanel({ state, growthNeed, onSetFocus, onQueueBuilding }: Props) {
  const { city } = state
  const output = computeYields(state)
  let queueTurns = 0
  const researched = new Set(state.research.researched)
  const queued = new Set(city.buildQueue.map((q) => q.buildingId))
  const built = new Set(city.buildings)

  return (
    <section className="panel">
      <h2><GameIcon name="population"/> City — {city.name}</h2>
      <div className="meta">
        <span>
          Population <strong>{city.population}</strong>
        </span>
        <span>
          Growth <strong>{city.foodBin}</strong> / {growthNeed}
        </span>
        <span>
          Focus <strong>{city.focus}</strong>
        </span>
      </div>

      <ProgressMeter label="Population growth" value={city.foodBin} max={growthNeed} rate={output.food-city.population}/><div className="row">
        {FOCUSES.map((focus) => (
          <button
            key={focus}
            type="button"
            aria-pressed={city.focus === focus} className={city.focus === focus ? 'active' : undefined}
            onClick={() => onSetFocus(focus)}
          >
            <GameIcon name={focus}/> Focus {focus}
          </button>
        ))}
      </div>

      <h2>Build queue</h2>
      {city.buildQueue.length === 0 ? (
        <p className="muted">Nothing queued</p>
      ) : (
        <ul className="list">
          {city.buildQueue.map((item) => {
            const def = BUILDINGS[item.buildingId]
            queueTurns += Math.ceil((def.cost-item.progress)/output.production)
            return (
              <li key={item.buildingId}>
                <span className="name"><GameIcon name={def.id}/> {def.name}</span>
                <span className="badge">
                  {item.progress} / {def.cost} · ready in ~{queueTurns} turns at current output
                </span><ProgressMeter label={def.name} value={item.progress} max={def.cost} rate={output.production} turns={queueTurns}/>
              </li>
            )
          })}
        </ul>
      )}

      <h2>Buildings</h2>
      <ul className="list">
        {BUILDING_ORDER.map((id) => {
          const def = BUILDINGS[id]
          const isBuilt = built.has(id)
          const isQueued = queued.has(id)
          const locked = def.requiresTech !== null && !researched.has(def.requiresTech)
          const canQueue = canQueueBuilding(state,id)

          return (
            <li key={id}>
              <span className="name"><GameIcon name={def.id}/> {def.name}</span>
              {isBuilt && <span className="badge done"><GameIcon name="check"/> Built</span>}
              {isQueued && <span className="badge active">Queued</span>}
              {locked && <span className="badge locked"><GameIcon name="lock"/> Needs {def.requiresTech ? TECHS[def.requiresTech].name : ""}</span>}
              {!isBuilt && !isQueued && !locked && (
                <span className="badge">Cost {def.cost}</span>
              )}
              <span className="desc">{def.description}</span>
              {canQueue && (
                <button type="button" aria-label={`Queue ${def.name}`} onClick={() => onQueueBuilding(id)}>
                  Queue
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}



