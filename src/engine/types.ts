export type ResourceId = 'food' | 'production' | 'gold' | 'science'

export type Focus = ResourceId

export type BuildingId = 'granary' | 'workshop' | 'market' | 'library'

export type TechId =
  | 'agriculture'
  | 'pottery'
  | 'crafting'
  | 'currency'
  | 'writing'
  | 'astronomy'

export type Yields = Record<ResourceId, number>

export type Stockpiles = Yields

export interface BuildQueueItem {
  buildingId: BuildingId
  progress: number
}

export interface City {
  name: string
  population: number
  /** Food accumulated toward next population point */
  foodBin: number
  focus: Focus
  buildings: BuildingId[]
  buildQueue: BuildQueueItem[]
}

export interface ResearchState {
  researched: TechId[]
  current: TechId | null
  progress: number
}

export type GameEvent =
  | { type: 'yields'; yields: Yields }
  | { type: 'grew'; population: number }
  | { type: 'starved'; population: number }
  | { type: 'buildingComplete'; buildingId: BuildingId }
  | { type: 'buildingProgress'; buildingId: BuildingId; progress: number; cost: number }
  | { type: 'researchComplete'; techId: TechId }
  | { type: 'researchProgress'; techId: TechId; progress: number; cost: number }
  | { type: 'victory'; techId: TechId }
  | { type: 'turnEnded'; turn: number }

export interface GameState {
  turn: number
  stockpiles: Stockpiles
  city: City
  research: ResearchState
  /** Events from the most recent endTurn (empty at game start) */
  lastEvents: GameEvent[]
  /** Optional sandbox win when Astronomy is researched */
  victory: boolean
}

export type Action =
  | { type: 'setFocus'; focus: Focus }
  | { type: 'queueBuilding'; buildingId: BuildingId }
  | { type: 'chooseResearch'; techId: TechId }
  | { type: 'endTurn' }

export interface ReduceResult {
  state: GameState
  events: GameEvent[]
}

export interface BuildingDef {
  id: BuildingId
  name: string
  description: string
  cost: number
  /** Tech required to queue (null = available at start) */
  requiresTech: TechId | null
  yieldBonus: Partial<Yields>
}

export interface TechDef {
  id: TechId
  name: string
  description: string
  cost: number
  requires: TechId[]
  /** Capstone win flag */
  victory?: boolean
}
