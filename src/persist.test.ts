import { afterEach, describe, expect, it, vi } from 'vitest'
import { decodeSave, loadSession, saveGame } from './persist'
import { createInitialState } from './engine'
afterEach(()=>vi.unstubAllGlobals())
describe('save recovery',()=>{
 it('loads legacy snapshots and versioned saves',()=>{
  const state=createInitialState()
  expect(decodeSave(JSON.stringify(state))).toEqual(state)
  expect(decodeSave(JSON.stringify({version:1,state}))).toEqual(state)
 })
 it('rejects malformed data and unsupported versions',()=>{
  for(const raw of ['{','{}','null',JSON.stringify({version:2,state:createInitialState()}),JSON.stringify({...createInitialState(),city:{}})]) expect(()=>decodeSave(raw)).toThrow()
 })
 it('preserves invalid stored data without writing',()=>{
  const setItem=vi.fn();vi.stubGlobal('localStorage',{getItem:()=> '{}',setItem})
  expect(loadSession().error).toBeTruthy();expect(setItem).not.toHaveBeenCalled()
 })
 it('handles unavailable storage',()=>{
  vi.stubGlobal('localStorage',{getItem:()=>{throw Error()},setItem:()=>{throw Error()}})
  expect(loadSession().error).toBeTruthy();expect(saveGame(createInitialState())).toBeTruthy()
 })
 it('writes a versioned envelope',()=>{
  const setItem=vi.fn();vi.stubGlobal('localStorage',{setItem})
  expect(saveGame(createInitialState())).toBeNull()
  expect(JSON.parse(setItem.mock.calls[0][1]).version).toBe(1)
 })
 it('drops untrusted report payloads',()=>{
  expect(decodeSave(JSON.stringify({...createInitialState(),lastEvents:[{type:'buildingComplete',buildingId:'missing'}]})).lastEvents).toEqual([])
 })
})
