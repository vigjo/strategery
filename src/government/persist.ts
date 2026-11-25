import { createInitialState, reduce, type State, type PolicyId } from './engine';
export const KEY = 'strategery.government.v1';
export interface Session {
    current: State | null;
    previous: State | null;
}
export const emptySession = (): Session => ({ current: null, previous: null });
function validate(value: unknown): State | null {
    if (value === null)
        return null;
    if (!value || typeof value !== 'object')
        throw Error('Invalid run');
    const s = value as State;
    if (!['executive', 'political'].includes(s.mode) || !Array.isArray(s.history) || s.history.length > 12)
        throw Error('Invalid run');
    let replay = createInitialState(s.mode);
    for (const h of s.history) {
        if (!h || !Array.isArray(h.decisions) || !h.decisions.every(id => typeof id === 'string') || !Array.isArray(h.blocked) || !h.blocked.every(x => typeof x === 'string'))
            throw Error('Invalid history');
        const result = reduce(replay, { type: 'submitTurn', decisions: h.decisions as PolicyId[], blocked: h.blocked });
        if (result.state === replay)
            throw Error('Invalid decisions');
        replay = result.state;
    }
    // Reconstruct all state from validated deterministic decisions, not imported fields.
    if (JSON.stringify(replay) !== JSON.stringify(s))
        throw Error('Inconsistent run');
    return replay;
}
export function decode(raw: string): Session {
    const v = JSON.parse(raw);
    if (v?.version !== 1)
        throw Error('Unsupported save version');
    const current = validate(v.current), previous = validate(v.previous);
    if (previous && previous.turn !== 13)
        throw Error('Comparison must be a completed run');
    return { current, previous };
}
export function encode(s: Session) { return JSON.stringify({ version: 1, ...s }); }
export function load(): {
    session: Session;
    error: string | null;
} {
    try {
        const raw = localStorage.getItem(KEY);
        return { session: raw ? decode(raw) : emptySession(), error: null };
    }
    catch {
        return { session: emptySession(), error: 'Save could not be loaded. The original is preserved. Export it or explicitly start over.' };
    }
}
export function save(s: Session): string | null { try {
    localStorage.setItem(KEY, encode(s));
    return null;
}
catch {
    return 'Saving unavailable. Export before closing.';
} }
export function download(s: Session, original = false) { const raw = original ? localStorage.getItem(KEY) : encode(s); if (!raw)
    throw Error('No save'); const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'strategery-government.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
