import { BUILDINGS, TECHS, createInitialState, type GameState } from './engine'
const KEY = 'strategery.save.v1'
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const number = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0
const ids = (v: unknown, catalog: object): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string' && Object.hasOwn(catalog,x)) && new Set(v).size === v.length
export function decodeSave(raw: string): GameState {
 const parsed: unknown = JSON.parse(raw)
 if (!record(parsed)) throw Error('Invalid save')
 if ('version' in parsed && parsed.version !== 1) throw Error('Unsupported save version')
 const s = 'version' in parsed ? parsed.state : parsed
 if (!record(s) || !number(s.turn) || s.turn < 1 || !record(s.stockpiles) || !['food','production','gold','science'].every(k=>number(s.stockpiles && (s.stockpiles as Record<string,unknown>)[k])) || !record(s.city) || !record(s.research) || typeof s.victory !== 'boolean') throw Error('Invalid save')
 const c=s.city, r=s.research
 if (typeof c.name !== 'string' || !number(c.population) || c.population < 1 || !number(c.foodBin) || !['food','production','gold','science'].includes(String(c.focus)) || !ids(c.buildings,BUILDINGS) || !Array.isArray(c.buildQueue) || !c.buildQueue.every(q=>record(q) && typeof q.buildingId==='string' && Object.hasOwn(BUILDINGS,q.buildingId) && number(q.progress)) || !ids(r.researched,TECHS) || !(r.current===null || typeof r.current==='string' && Object.hasOwn(TECHS,r.current)) || !number(r.progress)) throw Error('Invalid save')
 const state = s as unknown as GameState
 if (typeof c.focus !== 'string' || state.city.foodBin >= 10 + state.city.population * 5) throw Error('Invalid city')
 if (state.research.researched.some(id=>TECHS[id].requires.some(req=>!state.research.researched.includes(req)))) throw Error('Invalid research prerequisites')
 if (state.research.current === null ? state.research.progress !== 0 : state.research.researched.includes(state.research.current) || state.research.progress >= TECHS[state.research.current].cost || TECHS[state.research.current].requires.some(req=>!state.research.researched.includes(req))) throw Error('Invalid research progress')
 if ([...state.city.buildings,...state.city.buildQueue.map(q=>q.buildingId)].some(id=>{const req=BUILDINGS[id].requiresTech;return req !== null && !state.research.researched.includes(req)}) || state.city.buildQueue.some(q=>q.progress >= BUILDINGS[q.buildingId].cost)) throw Error('Invalid construction')
 if (new Set(state.city.buildQueue.map(q=>q.buildingId)).size !== state.city.buildQueue.length || state.city.buildQueue.some(q=>state.city.buildings.includes(q.buildingId))) throw Error('Invalid queue')
 // Reports are transient presentation data; never trust persisted event payloads.
 return {...state,lastEvents:[]}
}
export function loadSession(): {state:GameState;error:string|null} {
 try { const raw=localStorage.getItem(KEY); return {state:raw ? decodeSave(raw) : createInitialState(),error:null} }
 catch { return {state:createInitialState(),error:'Your save could not be loaded. It has been preserved. Export it for recovery or explicitly start a new game.'} }
}
export function saveGame(state: GameState): string | null {
 try {localStorage.setItem(KEY,JSON.stringify({version:1,state}));return null}
 catch {return 'Saving is unavailable. Export your game before closing this page.'}
}
export function exportSave(state:GameState, original=false) {
 const raw = original ? localStorage.getItem(KEY) : JSON.stringify({version:1,state},null,2)
 if (!raw) throw Error('No saved data available')
 const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}))
 const link=document.createElement('a');link.href=url;link.download='strategery-save.json';link.click();URL.revokeObjectURL(url)
}
