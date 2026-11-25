import { createInitialState, type State, type PolicyId, type Indicators } from '../government/engine';
import type { IconName } from './GameIcon';
export const indicatorMeta: Record<keyof Indicators, {
    label: string;
    icon: IconName;
}> = {
    treasury: { label: 'Treasury', icon: 'gold' }, approval: { label: 'Public approval', icon: 'population' }, energy: { label: 'Energy security', icon: 'energy' }, relations: { label: 'Veyra relations', icon: 'diplomacy' },
};
export const policyMeta: Record<PolicyId, {
    icon: IconName;
    group: 'Domestic' | 'Diplomatic' | 'Government Management' | 'Response';
}> = {
    relief: { icon: 'relief', group: 'Domestic' }, program: { icon: 'energy', group: 'Domestic' }, purchase: { icon: 'ship', group: 'Domestic' }, agreement: { icon: 'agreement', group: 'Diplomatic' }, outreach: { icon: 'diplomacy', group: 'Diplomatic' }, address: { icon: 'address', group: 'Domestic' }, coalition: { icon: 'population', group: 'Government Management' }, coordinate: { icon: 'cabinet', group: 'Government Management' }, reserves: { icon: 'ship', group: 'Response' }, ration: { icon: 'ration', group: 'Response' }, disclose: { icon: 'document', group: 'Response' }, deflect: { icon: 'address', group: 'Response' }, concede: { icon: 'agreement', group: 'Response' }, decline: { icon: 'shield', group: 'Response' },
};
export function indicatorDeltas(s: State): Indicators | null {
    if (!s.history.length)
        return null;
    const prior = s.history.length > 1 ? s.history[s.history.length - 2].indicators : createInitialState(s.mode).indicators;
    return { treasury: s.indicators.treasury - prior.treasury, approval: s.indicators.approval - prior.approval, energy: s.indicators.energy - prior.energy, relations: s.indicators.relations - prior.relations };
}
export const signed = (n: number) => n > 0 ? `+${n}` : String(n);
