import { useCallback, useEffect, useState } from 'react'
import {
  canChooseResearch,
  canQueueBuilding,
  computeYields,
  createInitialState,
  foodToGrow,
  reduce,
  type Action,
  type Focus,
  type GameState,
} from '../engine'
import { clearSave, loadOrNew, saveGame } from '../persist'
import { CityPanel } from './CityPanel'
import { TechPanel } from './TechPanel'
import { TurnLog } from './TurnLog'

export function App() {
  const [state, setState] = useState<GameState>(() => loadOrNew())

  useEffect(() => {
    saveGame(state)
  }, [state])

  const dispatch = useCallback((action: Action) => {
    setState((prev) => reduce(prev, action).state)
  }, [])

  const preview = computeYields(state)
  const growthNeed = foodToGrow(state.city.population)

  function newGame() {
    clearSave()
    setState(createInitialState())
  }

  return (
    <div className="app">
      <header className="top-bar">
        <h1>Strategery</h1>
        <div className="resources">
          <span>
            Turn<strong>{state.turn}</strong>
          </span>
          <span>
            Food<strong>{state.stockpiles.food}</strong>
            <span className="muted"> (+{preview.food}/t)</span>
          </span>
          <span>
            Prod<strong>{state.stockpiles.production}</strong>
            <span className="muted"> (+{preview.production}/t)</span>
          </span>
          <span>
            Gold<strong>{state.stockpiles.gold}</strong>
            <span className="muted"> (+{preview.gold}/t)</span>
          </span>
          <span>
            Sci<strong>{state.stockpiles.science}</strong>
            <span className="muted"> (+{preview.science}/t)</span>
          </span>
        </div>
        <button type="button" className="primary" onClick={() => dispatch({ type: 'endTurn' })}>
          End turn
        </button>
        <button type="button" onClick={newGame}>
          New game
        </button>
      </header>

      {state.victory && (
        <div className="victory">Victory — Astronomy researched. Keep playing if you like.</div>
      )}

      <div className="panels">
        <CityPanel
          state={state}
          growthNeed={growthNeed}
          onSetFocus={(focus: Focus) => dispatch({ type: 'setFocus', focus })}
          onQueueBuilding={(buildingId) => {
            if (canQueueBuilding(state, buildingId)) {
              dispatch({ type: 'queueBuilding', buildingId })
            }
          }}
        />
        <TechPanel
          state={state}
          onChooseResearch={(techId) => {
            if (canChooseResearch(state, techId)) {
              dispatch({ type: 'chooseResearch', techId })
            }
          }}
        />
        <TurnLog events={state.lastEvents} />
      </div>
    </div>
  )
}
