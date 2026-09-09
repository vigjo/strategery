import { BUILDINGS } from './content'
import type { City, Focus, GameState, Yields } from './types'

/** Food needed in the bin to grow one population */
export function foodToGrow(population: number): number {
  return 10 + population * 5
}

/** Base yields from population and city focus (before buildings) */
export function focusYields(population: number, focus: Focus): Yields {
  // City center provides a little of everything; focus adds the whole workforce.
  const base: Yields = {
    food: 2,
    production: 1,
    gold: 1,
    science: 1,
  }
  base[focus] += population
  return base
}

export function buildingYields(city: City): Yields {
  const totals: Yields = { food: 0, production: 0, gold: 0, science: 0 }
  for (const id of city.buildings) {
    const bonus = BUILDINGS[id].yieldBonus
    for (const key of Object.keys(totals) as (keyof Yields)[]) {
      totals[key] += bonus[key] ?? 0
    }
  }
  return totals
}

export function computeYields(state: GameState): Yields {
  const fromFocus = focusYields(state.city.population, state.city.focus)
  const fromBuildings = buildingYields(state.city)
  return {
    food: fromFocus.food + fromBuildings.food,
    production: fromFocus.production + fromBuildings.production,
    gold: fromFocus.gold + fromBuildings.gold,
    science: fromFocus.science + fromBuildings.science,
  }
}
