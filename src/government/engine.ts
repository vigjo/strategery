export type Mode = 'executive' | 'political';
export interface Indicators {
    treasury: number;
    approval: number;
    energy: number;
    relations: number;
}
export interface Policy {
    name: string;
    description: string;
    cost: number;
    effect?: Partial<Indicators>;
    approval?: boolean;
    coordination?: boolean;
    cooldown?: boolean;
    political?: boolean;
    eventTurn?: number;
}
export const POLICIES = {
    relief: { name: 'Fuel relief', description: 'Spend 6; approval +5. No consecutive turns.', cost: 6, effect: { approval: 5 }, approval: true, coordination: true, cooldown: true },
    program: { name: 'Domestic energy program', description: 'Spend 12 now, then 3 for three turns. Energy +15 after the third payment.', cost: 12, approval: true, coordination: true },
    purchase: { name: 'Emergency energy purchase', description: 'Spend 10; energy +10.', cost: 10, effect: { energy: 10 }, coordination: true },
    agreement: { name: 'Negotiate supply agreement', description: 'Resolves next turn at relations ≥45. On success: relations +8; three deliveries of +5 energy costing 4 each.', cost: 0, approval: true, coordination: true },
    outreach: { name: 'Diplomatic outreach', description: 'Spend 3; relations +10.', cost: 3, effect: { relations: 10 }, coordination: true },
    address: { name: 'Public address', description: 'Approval +2. No consecutive turns. The podium remains domestically manufactured.', cost: 0, effect: { approval: 2 }, cooldown: true },
    coalition: { name: 'Build coalition', description: 'Spend 3; legislative support +10.', cost: 3, political: true },
    coordinate: { name: 'Coordinate cabinet', description: 'Restore 2 coordination, up to 3.', cost: 0, political: true },
    reserves: { name: 'Buy replacement supply', description: 'Spend 8; energy +8.', cost: 8, effect: { energy: 8 }, eventTurn: 3 },
    ration: { name: 'Introduce rationing', description: 'Energy +6; approval −4.', cost: 0, effect: { energy: 6, approval: -4 }, eventTurn: 3 },
    disclose: { name: 'Publish the accounts', description: 'Spend 2; approval +5, relations −2.', cost: 2, effect: { approval: 5, relations: -2 }, eventTurn: 6 },
    deflect: { name: 'Defend the record', description: 'Approval −2; relations +3. A very comprehensive statement is promised.', cost: 0, effect: { approval: -2, relations: 3 }, eventTurn: 6 },
    concede: { name: 'Accept supplier concessions', description: 'Spend 5; energy +10, relations +5, approval −3.', cost: 5, effect: { energy: 10, relations: 5, approval: -3 }, eventTurn: 9 },
    decline: { name: 'Decline the offer', description: 'Approval +3; relations −5.', cost: 0, effect: { approval: 3, relations: -5 }, eventTurn: 9 },
} satisfies Record<string, Policy>;
export type PolicyId = keyof typeof POLICIES;
export const EVENTS: Record<number, {
    title: string;
    description: string;
    choices: PolicyId[];
}> = {
    3: { title: 'Supply disruption', description: 'Veyra reports pipeline maintenance. The timing has been described as entirely technical.', choices: ['reserves', 'ration'] },
    6: { title: 'Public scrutiny', description: 'The opposition requests an explanation of the emergency budget. Preferably one containing numbers.', choices: ['disclose', 'deflect'] },
    9: { title: 'A supplier proposal', description: 'Veyra offers extra energy in exchange for a public diplomatic concession.', choices: ['concede', 'decline'] },
};
export interface TurnRecord {
    turn: number;
    decisions: PolicyId[];
    unused: number;
    blocked: string[];
    report: string[];
    indicators: Indicators;
}
export interface State {
    mode: Mode;
    turn: number;
    indicators: Indicators;
    support: number;
    coordination: number;
    program: null | {
        started: number;
        remaining: number;
    };
    agreement: null | {
        started: number;
        remaining: number;
        pending: boolean;
    };
    history: TurnRecord[];
}
export type Action = {
    type: 'submitTurn';
    decisions: PolicyId[];
    blocked?: string[];
};
export function createInitialState(mode: Mode): State { return { mode, turn: 1, indicators: { treasury: 60, approval: 55, energy: 50, relations: 50 }, support: 55, coordination: 3, program: null, agreement: null, history: [] }; }
const clamp = (n: number) => Math.max(0, Math.min(100, n));
function normalize(s: State) { for (const k of ['approval', 'energy', 'relations'] as const)
    s.indicators[k] = clamp(s.indicators[k]); s.support = clamp(s.support); s.coordination = Math.max(0, Math.min(3, s.coordination)); }
export function available(s: State): PolicyId[] { return (Object.keys(POLICIES) as PolicyId[]).filter(id => { const p: Policy = POLICIES[id]; return (!p.political || s.mode === 'political') && (!p.eventTurn || p.eventTurn === s.turn); }); }
function reason(s: State, id: PolicyId, used: PolicyId[]): string | null {
    if (!Object.hasOwn(POLICIES, id))
        return 'Unknown decision.';
    const p: Policy = POLICIES[id];
    if (s.turn > 12)
        return 'This assessment is complete.';
    if (!available(s).includes(id))
        return 'Decision unavailable in this briefing.';
    if (used.includes(id))
        return 'Choose each decision at most once per turn.';
    if (p.eventTurn && used.some(x => (POLICIES[x] as Policy | undefined)?.eventTurn))
        return 'Choose only one response to this event.';
    if (p.cost > 0 && s.indicators.treasury < p.cost)
        return 'Insufficient treasury for the combined draft.';
    if (p.cooldown && s.history.at(-1)?.decisions.includes(id))
        return 'Unavailable on consecutive turns.';
    if (id === 'program' && s.program)
        return 'An energy program is already active.';
    if (id === 'agreement' && s.agreement)
        return 'An agreement is already pending or active.';
    if (s.mode === 'political' && p.approval && s.support < 60)
        return 'Requires 60 legislative support.';
    if (s.mode === 'political' && p.coordination && s.coordination < 1)
        return 'Requires 1 cabinet coordination.';
    return null;
}
function execute(s: State, id: PolicyId) {
    const p: Policy = POLICIES[id];
    s.indicators.treasury -= p.cost;
    for (const key of Object.keys(p.effect ?? {}) as (keyof Indicators)[])
        s.indicators[key] += p.effect![key]!;
    if (s.mode === 'political') {
        if (p.approval)
            s.support -= 5;
        if (p.coordination)
            s.coordination--;
        if (id === 'coalition')
            s.support += 10;
        if (id === 'coordinate')
            s.coordination += 2;
    }
    if (id === 'program')
        s.program = { started: s.turn, remaining: 3 };
    if (id === 'agreement')
        s.agreement = { started: s.turn, remaining: 3, pending: true };
    normalize(s);
}
export function preview(s: State, decisions: PolicyId[]) {
    const next = structuredClone(s), errors: string[] = [];
    const used: PolicyId[] = [];
    if (s.turn > 12)
        errors.push('This run is complete.');
    if (decisions.length > 2)
        errors.push('Choose at most two actions.');
    for (const id of decisions) {
        const error = reason(next, id, used);
        if (error)
            errors.push(`${Object.hasOwn(POLICIES, id) ? POLICIES[id].name : id}: ${error}`);
        else
            execute(next, id);
        used.push(id);
    }
    return { state: next, errors };
}
export function obligations(s: State) { return 6 + (s.program ? 3 : 0) + (s.agreement ? 4 : 0); }
export function reduce(state: State, action: Action): {
    state: State;
    events: string[];
} {
    const checked = preview(state, action.decisions);
    if (checked.errors.length)
        return { state, events: checked.errors };
    const next = checked.state, report = action.decisions.map(id => `${POLICIES[id].name}: ${POLICIES[id].description}`);
    next.indicators.treasury += 4;
    report.push('Revenue +10; baseline expenditure −6.');
    if (next.program && next.program.started < next.turn) {
        next.indicators.treasury -= 3;
        next.program.remaining--;
        report.push('Energy program upkeep −3.');
        if (!next.program.remaining) {
            next.indicators.energy += 15;
            next.program = null;
            report.push('Domestic program completed: energy +15.');
        }
    }
    if (next.agreement && next.agreement.started < next.turn) {
        if (next.agreement.pending) {
            if (next.indicators.relations < 45) {
                next.agreement = null;
                report.push('Veyra declined the agreement: relations below 45.');
            }
            else {
                next.agreement.pending = false;
                next.indicators.relations += 8;
                report.push('Supply agreement accepted: relations +8.');
            }
        }
        if (next.agreement) {
            next.indicators.treasury -= 4;
            next.indicators.energy += 5;
            next.agreement.remaining--;
            report.push('Supply delivery: treasury −4, energy +5.');
            if (!next.agreement.remaining)
                next.agreement = null;
        }
    }
    next.indicators.energy = clamp(next.indicators.energy - 4);
    report.push('Energy demand −4.');
    const penalty = next.indicators.energy < 20 ? 6 : next.indicators.energy < 35 ? 3 : 0;
    if (penalty) {
        next.indicators.approval -= penalty;
        report.push(`Energy shortage: approval −${penalty}.`);
    }
    if (next.indicators.treasury < 0) {
        next.indicators.approval -= 3;
        report.push('Debt: approval −3.');
    }
    normalize(next);
    if (next.mode === 'political') {
        if (next.indicators.approval < 35) {
            next.support -= 3;
            report.push('Low approval: legislative support −3.');
        }
        else if (next.indicators.approval > 65) {
            next.support += 2;
            report.push('High approval: legislative support +2.');
        }
    }
    normalize(next);
    next.history.push({ turn: next.turn, decisions: [...action.decisions], unused: 2 - action.decisions.length, blocked: action.blocked ?? [], report, indicators: { ...next.indicators } });
    next.turn++;
    if (next.turn <= 12 && next.mode === 'political')
        next.coordination = Math.min(3, next.coordination + 1);
    return { state: next, events: report };
}
export function assessment(s: State) { const i = s.indicators; return [`Public welfare: ${i.approval >= 55 ? 'Public confidence held' : i.approval >= 35 ? 'Public confidence is fragile' : 'Government faces a public confidence crisis'} (${i.approval}/100).`, `Fiscal position: ${i.treasury >= 0 ? 'Treasury remains solvent' : 'Government is in debt'} (${i.treasury}).`, `Energy resilience: ${i.energy >= 50 ? 'Supply is resilient' : i.energy >= 35 ? 'Supply remains vulnerable' : 'Shortages persist'} (${i.energy}/100).`, `Diplomacy: ${i.relations >= 60 ? 'A constructive supplier relationship' : i.relations >= 45 ? 'A workable supplier relationship' : 'Relations with Veyra are strained'} (${i.relations}/100).`]; }
