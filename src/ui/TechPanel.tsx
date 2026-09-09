import { TECH_ORDER, TECHS, type GameState, type TechId } from '../engine'

interface Props {
  state: GameState
  onChooseResearch: (techId: TechId) => void
}

export function TechPanel({ state, onChooseResearch }: Props) {
  const researched = new Set(state.research.researched)
  const { current, progress } = state.research

  return (
    <section className="panel">
      <h2>Research</h2>
      {current ? (
        <div className="meta">
          <span>
            Current <strong>{TECHS[current].name}</strong>
          </span>
          <span>
            Progress <strong>{progress}</strong> / {TECHS[current].cost}
          </span>
        </div>
      ) : (
        <p className="muted">No research selected</p>
      )}

      <ul className="list">
        {TECH_ORDER.map((id) => {
          const def = TECHS[id]
          const done = researched.has(id)
          const unlocked = def.requires.every((req) => researched.has(req))
          const locked = !done && !unlocked
          const isCurrent = current === id
          const canChoose = !done && unlocked

          return (
            <li key={id}>
              <span className="name">{def.name}</span>
              {done && <span className="badge done">Done</span>}
              {isCurrent && <span className="badge active">Researching</span>}
              {locked && (
                <span className="badge locked">
                  Needs {def.requires.join(', ')}
                </span>
              )}
              {!done && !locked && !isCurrent && (
                <span className="badge">Cost {def.cost}</span>
              )}
              {def.victory && <span className="badge">Victory</span>}
              <span className="desc">{def.description}</span>
              {canChoose && (
                <button
                  type="button"
                  className={isCurrent ? 'active' : undefined}
                  onClick={() => onChooseResearch(id)}
                >
                  {isCurrent ? 'Selected' : 'Research'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
