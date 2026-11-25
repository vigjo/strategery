import { describe, expect, it } from 'vitest'
import {
  BUILDINGS,
  TECHS,
  canQueueBuilding,
  computeYields,
  createInitialState,
  foodToGrow,
  reduce,
} from './index'

describe('createInitialState', () => {
  it('starts on turn 1 with a small capital', () => {
    const s = createInitialState()
    expect(s.turn).toBe(1)
    expect(s.city.population).toBe(2)
    expect(s.city.buildings).toEqual([])
    expect(s.research.researched).toEqual([])
    expect(s.victory).toBe(false)
  })
})

describe('setFocus', () => {
  it('changes city focus', () => {
    const s = createInitialState()
    const { state } = reduce(s, { type: 'setFocus', focus: 'science' })
    expect(state.city.focus).toBe('science')
  })
})

describe('endTurn yields', () => {
  it('adds computed yields to stockpiles and advances turn', () => {
    const s = createInitialState()
    const yields = computeYields(s)
    const { state, events } = reduce(s, { type: 'endTurn' })

    expect(state.turn).toBe(2)
    expect(state.stockpiles.food).toBe(s.stockpiles.food + yields.food)
    expect(state.stockpiles.production).toBe(
      s.stockpiles.production + yields.production,
    )
    expect(state.stockpiles.gold).toBe(s.stockpiles.gold + yields.gold)
    expect(state.stockpiles.science).toBe(s.stockpiles.science + yields.science)
    expect(events.some((e) => e.type === 'yields')).toBe(true)
    expect(events.some((e) => e.type === 'turnEnded' && e.turn === 2)).toBe(true)
    expect(state.lastEvents).toEqual(events)
  })

  it('focus science increases science yield', () => {
    const food = createInitialState()
    const sci = reduce(food, { type: 'setFocus', focus: 'science' }).state
    expect(computeYields(sci).science).toBeGreaterThan(computeYields(food).science)
  })
})

describe('population growth', () => {
  it('grows when food bin reaches threshold', () => {
    let s = createInitialState()
    s = reduce(s, { type: 'setFocus', focus: 'food' }).state
    const before = s.city.population
    let sawGrowth = false
    for (let i = 0; i < 30; i++) {
      const { state, events } = reduce(s, { type: 'endTurn' })
      s = state
      if (events.some((e) => e.type === 'grew')) sawGrowth = true
    }
    expect(s.city.population).toBeGreaterThan(before)
    expect(sawGrowth).toBe(true)
  })

  it('uses foodToGrow based on population', () => {
    expect(foodToGrow(2)).toBe(20)
    expect(foodToGrow(3)).toBe(25)
  })
})

describe('buildings', () => {
  it('rejects queueing a building that requires unmet tech', () => {
    const s = createInitialState()
    expect(canQueueBuilding(s, 'granary')).toBe(false)
    const { state } = reduce(s, { type: 'queueBuilding', buildingId: 'granary' })
    expect(state.city.buildQueue).toEqual([])
  })

  it('completes a queued building when production accumulates', () => {
    let s = createInitialState()
    s = {
      ...s,
      research: { ...s.research, researched: ['agriculture', 'pottery'] },
    }
    expect(canQueueBuilding(s, 'granary')).toBe(true)
    s = reduce(s, { type: 'queueBuilding', buildingId: 'granary' }).state
    s = reduce(s, { type: 'setFocus', focus: 'production' }).state

    let turns = 0
    let completed = false
    while (!s.city.buildings.includes('granary') && turns < 40) {
      const { state, events } = reduce(s, { type: 'endTurn' })
      s = state
      turns++
      if (events.some((e) => e.type === 'buildingComplete')) completed = true
    }

    expect(s.city.buildings).toContain('granary')
    expect(s.city.buildQueue).toEqual([])
    expect(completed).toBe(true)
    expect(turns).toBeGreaterThan(0)
    expect(turns).toBeLessThanOrEqual(BUILDINGS.granary.cost)
  })

  it('rejects duplicate queue and already-built', () => {
    let s = createInitialState()
    s = {
      ...s,
      research: { ...s.research, researched: ['agriculture', 'pottery'] },
      city: { ...s.city, buildings: ['granary'] },
    }
    expect(canQueueBuilding(s, 'granary')).toBe(false)
  })
})

describe('research', () => {
  it('rejects locked tech', () => {
    const s = createInitialState()
    const { state } = reduce(s, { type: 'chooseResearch', techId: 'pottery' })
    expect(state.research.current).toBeNull()
  })

  it('completes research when science accumulates', () => {
    let s = createInitialState()
    s = reduce(s, { type: 'chooseResearch', techId: 'agriculture' }).state
    s = reduce(s, { type: 'setFocus', focus: 'science' }).state

    const cost = TECHS.agriculture.cost
    let turns = 0
    while (!s.research.researched.includes('agriculture') && turns < 40) {
      s = reduce(s, { type: 'endTurn' }).state
      turns++
    }

    expect(s.research.researched).toContain('agriculture')
    expect(s.research.current).toBeNull()
    expect(s.lastEvents.some((e) => e.type === 'researchComplete')).toBe(true)
    expect(turns).toBeGreaterThan(0)
    expect(turns).toBeLessThanOrEqual(cost)
  })

  it('sets victory when astronomy completes', () => {
    let s = createInitialState()
    s = {
      ...s,
      research: {
        researched: ['agriculture', 'pottery', 'crafting', 'writing'],
        current: 'astronomy',
        progress: TECHS.astronomy.cost - 1,
      },
      city: { ...s.city, focus: 'science' },
    }
    s = reduce(s, { type: 'endTurn' }).state
    expect(s.victory).toBe(true)
    expect(s.research.researched).toContain('astronomy')
    expect(s.lastEvents.some((e) => e.type === 'victory')).toBe(true)
  })
})

it('rejects a duplicate queued building without mutating the input',()=>{
 const initial=createInitialState();initial.research.researched=['agriculture','pottery']
 const queued=reduce(initial,{type:'queueBuilding',buildingId:'granary'}).state
 const before=JSON.stringify(queued)
 expect(reduce(queued,{type:'queueBuilding',buildingId:'granary'}).state.city.buildQueue).toHaveLength(1)
 expect(JSON.stringify(queued)).toBe(before)
 expect(initial.city.buildQueue).toEqual([])
})
it('exposes starvation despite historical food totals',()=>{
 let state=createInitialState()
 for(let i=0;i<10;i++) state=reduce(state,{type:'endTurn'}).state
 expect(state.city.population).toBe(3)
 state=reduce(state,{type:'setFocus',focus:'science'}).state
 expect(reduce(state,{type:'endTurn'}).state.city.population).toBe(2)
})
it('completes Agriculture on precisely the seventh science-focused turn',()=>{
 let state=reduce(createInitialState(),{type:'chooseResearch',techId:'agriculture'}).state
 state=reduce(state,{type:'setFocus',focus:'science'}).state
 for(let i=0;i<6;i++)state=reduce(state,{type:'endTurn'}).state
 expect(state.research.progress).toBe(18)
 expect(state.research.researched).toEqual([])
 expect(reduce(state,{type:'endTurn'}).state.research.researched).toContain('agriculture')
})
