import { useCallback, useEffect, useState } from 'react'
import { computeYields, createInitialState, foodToGrow, reduce, type Action } from '../engine'
import { loadSession, saveGame, exportSave, decodeSave } from '../persist'
import { CityPanel } from './CityPanel'
import { TechPanel } from './TechPanel'
import { TurnLog } from './TurnLog'
import { GameIcon } from './GameIcon'
export function App() {
 const [session] = useState(loadSession)
 const [state,setState]=useState(session.state)
 const [blocked,setBlocked]=useState(!!session.error)
 const [error,setError]=useState(session.error)
 useEffect(()=>{if(!blocked) setError(saveGame(state))},[state,blocked])
 const dispatch=useCallback((action:Action)=>setState(prev=>reduce(prev,action).state),[])
 const yields=computeYields(state), net=yields.food-state.city.population
 function reset() {if(window.confirm('Replace your current game and save? Export first if you want to keep it.')) {setBlocked(false);setState(createInitialState());setError(null)}}
 return <main className="app">
 <header className="top-bar"><div><small>THE CAPITAL LEDGER</small><h1>Strategery</h1></div><span><GameIcon name="turn"/> Turn {state.turn}</span><button className="primary" disabled={blocked} onClick={()=>dispatch({type:'endTurn'})}>End turn <GameIcon name="forward"/></button></header>
 <section className="resource-grid" aria-label="Resources">
 <div className="resource food"><GameIcon name="food"/><span>Food income<strong>{yields.food} / turn</strong><small>{state.city.population} consumed · {net >= 0 ? '+' : ''}{net} growth</small></span></div>
 <div className="resource production"><GameIcon name="production"/><span>Production<strong>{yields.production} / turn</strong><small>Applied to the first queued building</small></span></div>
 <div className="resource science"><GameIcon name="science"/><span>Science<strong>{yields.science} / turn</strong><small>Applied to selected research</small></span></div>
 <div className="resource gold"><GameIcon name="gold"/><span>Gold treasury<strong>{state.stockpiles.gold}</strong><small>+{yields.gold}/turn · spending coming later</small></span></div>
 </section>
 {error && <div role="alert" className="notice">{error}</div>}
 <aside className="notice" aria-label="Next turn preview"><strong>Next turn</strong>{net < 0 && <p><GameIcon name="warning"/> Food deficit: one citizen will be lost and growth reset.</p>}{!state.research.current && <p>No research selected — this turn's science will not advance a technology.</p>}{!state.city.buildQueue.length && <p>No building queued — this turn's production will not advance construction.</p>}{net >= 0 && <p>Food surplus: {net}. {net ? 'Your city is growing.' : 'Population is stable.'}</p>}</aside>
 {state.victory && <div className="victory" role="status"><GameIcon name="victory"/> Astronomy discovered. Your civilization has reached the stars.</div>}
 <fieldset disabled={blocked} className="game-panels"><div className="panels"><CityPanel state={state} growthNeed={foodToGrow(state.city.population)} onSetFocus={focus=>dispatch({type:'setFocus',focus})} onQueueBuilding={buildingId=>dispatch({type:'queueBuilding',buildingId})}/><TechPanel state={state} onChooseResearch={techId=>dispatch({type:'chooseResearch',techId})}/><TurnLog events={state.lastEvents}/></div></fieldset>
 <footer className="row"><button onClick={()=>{try{exportSave(state,blocked)}catch{setError('Could not export saved data. Storage may be inaccessible.')}}}>{blocked?'Export original save':'Export game'}</button><label className="import-label">Import game<input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try {const imported=decodeSave(await file.text());if(window.confirm('Replace this game with the imported save?')){setState(imported);setBlocked(false);setError(null)}}catch{setError('Import failed: invalid or unsupported save. Your current game is unchanged.')}}}/></label><button onClick={reset}>New game</button><small role="status">{blocked ? 'Original save preserved' : error ? 'Save needs attention' : 'Saved automatically on this device'}</small></footer>
 </main>
}
