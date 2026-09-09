import type { BuildingDef, BuildingId, TechDef, TechId } from '../types'

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  granary: {
    id: 'granary',
    name: 'Granary',
    description: '+2 food per turn',
    cost: 40,
    requiresTech: 'pottery',
    yieldBonus: { food: 2 },
  },
  workshop: {
    id: 'workshop',
    name: 'Workshop',
    description: '+2 production per turn',
    cost: 50,
    requiresTech: 'crafting',
    yieldBonus: { production: 2 },
  },
  market: {
    id: 'market',
    name: 'Market',
    description: '+2 gold per turn',
    cost: 45,
    requiresTech: 'currency',
    yieldBonus: { gold: 2 },
  },
  library: {
    id: 'library',
    name: 'Library',
    description: '+2 science per turn',
    cost: 55,
    requiresTech: 'writing',
    yieldBonus: { science: 2 },
  },
}

export const TECHS: Record<TechId, TechDef> = {
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Foundational farming techniques',
    cost: 20,
    requires: [],
  },
  pottery: {
    id: 'pottery',
    name: 'Pottery',
    description: 'Unlocks the Granary',
    cost: 30,
    requires: ['agriculture'],
  },
  crafting: {
    id: 'crafting',
    name: 'Crafting',
    description: 'Unlocks the Workshop',
    cost: 35,
    requires: ['agriculture'],
  },
  currency: {
    id: 'currency',
    name: 'Currency',
    description: 'Unlocks the Market',
    cost: 40,
    requires: ['pottery'],
  },
  writing: {
    id: 'writing',
    name: 'Writing',
    description: 'Unlocks the Library',
    cost: 40,
    requires: ['pottery'],
  },
  astronomy: {
    id: 'astronomy',
    name: 'Astronomy',
    description: 'Look to the stars — sandbox victory',
    cost: 80,
    requires: ['writing', 'crafting'],
    victory: true,
  },
}

export const TECH_ORDER: TechId[] = [
  'agriculture',
  'pottery',
  'crafting',
  'currency',
  'writing',
  'astronomy',
]

export const BUILDING_ORDER: BuildingId[] = [
  'granary',
  'workshop',
  'market',
  'library',
]
