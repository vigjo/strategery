import { expect, it } from 'vitest';
import { createInitialState, reduce } from '../government/engine';
import { indicatorDeltas } from './presentation';
it('omits trends before any resolved turn', () => expect(indicatorDeltas(createInitialState('executive'))).toBeNull());
it('compares the first result with initial conditions, then consecutive results', () => {
    let s = reduce(createInitialState('executive'), { type: 'submitTurn', decisions: ['purchase'] }).state;
    expect(indicatorDeltas(s)).toEqual({ treasury: -6, approval: 0, energy: 6, relations: 0 });
    s = reduce(s, { type: 'submitTurn', decisions: [] }).state;
    expect(indicatorDeltas(s)).toEqual({ treasury: 4, approval: 0, energy: -4, relations: 0 });
});
