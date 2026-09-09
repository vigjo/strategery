import type { GameState } from './engine'
import { createInitialState } from './engine'

const STORAGE_KEY = 'strategery.save.v1'

export function saveGame(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function loadOrNew(): GameState {
  return loadGame() ?? createInitialState()
}
