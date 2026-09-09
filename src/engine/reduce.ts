import { BUILDINGS, TECHS } from './content'
import type {
  Action,
  BuildingId,
  Focus,
  GameEvent,
  GameState,
  ReduceResult,
  TechId,
} from './types'
import { computeYields, foodToGrow } from './yields'

export function createInitialState(): GameState {
  return {
    turn: 1,
    stockpiles: { food: 0, production: 0, gold: 10, science: 0 },
    city: {
      name: 'Capital',
      population: 2,
      foodBin: 0,
      focus: 'food',
      buildings: [],
      buildQueue: [],
    },
    research: {
      researched: [],
      current: null,
      progress: 0,
    },
    lastEvents: [],
    victory: false,
  }
}

function hasTech(state: GameState, techId: TechId): boolean {
  return state.research.researched.includes(techId)
}

function techUnlocked(state: GameState, techId: TechId): boolean {
  const def = TECHS[techId]
  return def.requires.every((req) => hasTech(state, req))
}

export function canQueueBuilding(
  state: GameState,
  buildingId: BuildingId,
): boolean {
  const def = BUILDINGS[buildingId]
  if (state.city.buildings.includes(buildingId)) return false
  if (state.city.buildQueue.some((q) => q.buildingId === buildingId)) return false
  if (def.requiresTech && !hasTech(state, def.requiresTech)) return false
  return true
}

export function canChooseResearch(state: GameState, techId: TechId): boolean {
  if (hasTech(state, techId)) return false
  if (!techUnlocked(state, techId)) return false
  return true
}

export function legalActions(state: GameState): Action[] {
  const actions: Action[] = [
    { type: 'endTurn' },
    ...(['food', 'production', 'gold', 'science'] as Focus[]).map(
      (focus) => ({ type: 'setFocus' as const, focus }),
    ),
  ]

  for (const buildingId of Object.keys(BUILDINGS) as BuildingId[]) {
    if (canQueueBuilding(state, buildingId)) {
      actions.push({ type: 'queueBuilding', buildingId })
    }
  }

  for (const techId of Object.keys(TECHS) as TechId[]) {
    if (canChooseResearch(state, techId)) {
      actions.push({ type: 'chooseResearch', techId })
    }
  }

  return actions
}

function applyEndTurn(state: GameState): ReduceResult {
  const events: GameEvent[] = []
  const next: GameState = structuredClone(state)

  // 1–2. Yields into stockpiles
  const yields = computeYields(next)
  events.push({ type: 'yields', yields })
  next.stockpiles.food += yields.food
  next.stockpiles.production += yields.production
  next.stockpiles.gold += yields.gold
  next.stockpiles.science += yields.science

  // 3. Food: growth / starvation
  // Surplus after feeding the population goes into the food bin.
  const foodConsumed = next.city.population
  const foodAvailable = yields.food
  if (foodAvailable < foodConsumed) {
    // Starvation: lose 1 pop if pop > 1
    if (next.city.population > 1) {
      next.city.population -= 1
      events.push({ type: 'starved', population: next.city.population })
    }
    next.city.foodBin = 0
  } else {
    const surplus = foodAvailable - foodConsumed
    next.city.foodBin += surplus
    let needed = foodToGrow(next.city.population)
    while (next.city.foodBin >= needed) {
      next.city.foodBin -= needed
      next.city.population += 1
      events.push({ type: 'grew', population: next.city.population })
      needed = foodToGrow(next.city.population)
    }
  }

  // Empire food stockpile is the running total of food yields (already added above).

  // 4. Production: advance build queue
  if (next.city.buildQueue.length > 0) {
    const item = next.city.buildQueue[0]
    const def = BUILDINGS[item.buildingId]
    const prod = yields.production
    item.progress += prod
    if (item.progress >= def.cost) {
      next.city.buildings.push(item.buildingId)
      next.city.buildQueue.shift()
      events.push({ type: 'buildingComplete', buildingId: item.buildingId })
    } else {
      events.push({
        type: 'buildingProgress',
        buildingId: item.buildingId,
        progress: item.progress,
        cost: def.cost,
      })
    }
  }

  // 5. Science: advance research
  if (next.research.current) {
    const techId = next.research.current
    const def = TECHS[techId]
    next.research.progress += yields.science
    if (next.research.progress >= def.cost) {
      next.research.researched.push(techId)
      next.research.current = null
      next.research.progress = 0
      events.push({ type: 'researchComplete', techId })
      if (def.victory) {
        next.victory = true
        events.push({ type: 'victory', techId })
      }
    } else {
      events.push({
        type: 'researchProgress',
        techId,
        progress: next.research.progress,
        cost: def.cost,
      })
    }
  }

  // 6. Gold already stockpiled

  // 7–8. Turn advance
  next.turn += 1
  events.push({ type: 'turnEnded', turn: next.turn })
  next.lastEvents = events

  return { state: next, events }
}

export function reduce(state: GameState, action: Action): ReduceResult {
  switch (action.type) {
    case 'setFocus': {
      const next = structuredClone(state)
      next.city.focus = action.focus
      return { state: next, events: [] }
    }
    case 'queueBuilding': {
      if (!canQueueBuilding(state, action.buildingId)) {
        return { state, events: [] }
      }
      const next = structuredClone(state)
      next.city.buildQueue.push({
        buildingId: action.buildingId,
        progress: 0,
      })
      return { state: next, events: [] }
    }
    case 'chooseResearch': {
      if (!canChooseResearch(state, action.techId)) {
        return { state, events: [] }
      }
      const next = structuredClone(state)
      // Switching research keeps no progress (simple v1)
      if (next.research.current !== action.techId) {
        next.research.current = action.techId
        next.research.progress = 0
      }
      return { state: next, events: [] }
    }
    case 'endTurn':
      return applyEndTurn(state)
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}
