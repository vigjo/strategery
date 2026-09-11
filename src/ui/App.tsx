import { useEffect, useState } from 'react';
import { POLICIES, EVENTS, available, preview, reduce, createInitialState, assessment, obligations, type Mode, type PolicyId, type Policy } from '../government/engine';
import { load, save, decode, download } from '../government/persist';
import { GameIcon, type IconName } from './GameIcon';
const icons: Record<string, IconName> = { treasury: 'gold', approval: 'population', energy: 'production', relations: 'astronomy' };
export function App() {
    const [initial] = useState(load), [session, setSession] = useState(initial.session), [blocked, setBlocked] = useState(!!initial.error), [error, setError] = useState(initial.error);
    const [draft, setDraft] = useState<PolicyId[]>([]), [attempts, setAttempts] = useState<string[]>([]), [message, setMessage] = useState('');
    const s = session.current;
    useEffect(() => { if (!blocked)
        setError(save(session)); }, [session, blocked]);
    function start(mode: Mode) { setSession({ ...session, current: createInitialState(mode) }); setDraft([]); setAttempts([]); setBlocked(false); setMessage(''); }
    function add(id: PolicyId) { const errors = draft.length >= 2 ? ['Both decision slots are occupied.'] : preview(s!, [...draft, id]).errors; if (errors.length) {
        setMessage(errors.join(' '));
        setAttempts(a => [...a, ...errors]);
        return;
    } setDraft([...draft, id]); setMessage(''); }
    const checked = s ? preview(s, draft) : null;
    return <main className="app">
 <header className="top-bar"><div><small>REPUBLIC OF BELVAR · OFFICE OF THE PRESIDENT</small><h1>Strategery</h1></div>{s && <span>{s.mode === 'executive' ? 'Executive' : 'Political'} government · {s.turn <= 12 ? `Turn ${s.turn} / 12` : 'Assessment'}</span>}</header>
 {error && <div className="notice" role="alert">{error}</div>}
 {blocked ? <button onClick={() => { if (confirm('Replace the unreadable government save? Export it first to preserve a copy.')) {
            setSession({ current: null, previous: null });
            setBlocked(false);
        } }}>Start over</button> : !s ? <section className="panel"><h2>Two ways to govern</h2><p>Belvar has elected you. Its energy supplier, Veyra, has sent congratulations and a revised invoice.</p><p>Manage a 12-turn crisis. Each turn permits two ordered decisions. There is no single victory score.</p><div className="mode-grid"><article><h3>Executive</h3><p>Your cabinet executes valid decisions. Balance money, public confidence and foreign commitments.</p><button className="primary" onClick={() => start('executive')}>Start Executive</button></article><article><h3>Political</h3><p>The same crisis, with legislative support and limited cabinet coordination. Build coalitions to enact policy.</p><button className="primary" onClick={() => start('political')}>Start Political</button></article></div></section> : <>
 <section aria-label="Country" className="resource-grid">{Object.entries(s.indicators).map(([key, value]) => <div className="resource" key={key}><GameIcon name={icons[key]}/><span>{key === 'relations' ? 'Veyra relations' : key === 'energy' ? 'Energy security' : key === 'approval' ? 'Public approval' : 'Treasury'}<strong>{value}{key !== 'treasury' ? '/100' : ''}</strong></span></div>)}</section>
 {s.turn <= 12 ? <>
 <section className="panel"><h2>Briefing</h2><p>{EVENTS[s.turn]?.description ?? 'Your cabinet awaits instructions. Predictable consequences appear below; future developments are not yet known.'}</p>{EVENTS[s.turn] && <p><strong>{EVENTS[s.turn].title}</strong> — choose at most one response below, or leave it unanswered this turn.</p>}<p>Income +10 per turn. Baseline expenses 6. Energy demand −4. Shortages below 35/20 cost 3/6 approval; debt costs 3 approval.</p></section>
 <div className="panels"><section className="panel"><h2>Cabinet</h2>{s.mode === 'political' ? <p>Legislative support <strong>{s.support}/100</strong> · Coordination <strong>{s.coordination}/3</strong>. Restore 1 coordination each new turn. Approval below 35 reduces support by 3; above 65 adds 2.</p> : <p>Ministers advise; your valid decisions are executed.</p>}<ul className="list">{available(s).map(id => { const p: Policy = POLICIES[id]; const reasons = preview(s, [...draft, id]).errors; return <li key={id}><span className="name"><GameIcon name={p.eventTurn ? 'warning' : p.political ? 'population' : 'writing'}/> {p.name}</span><span className="desc">{p.description}</span>{s.mode === 'political' && <small>{p.approval ? 'Requires 60 support; approval consumes 5. ' : ''}{p.coordination ? 'Uses 1 coordination.' : ''}</small>}{reasons.length > 0 && <small>{reasons.join(' ')}</small>}<button aria-label={`Draft ${p.name}`} onClick={() => add(id)}>Draft</button></li>; })}</ul></section>
 <div><section className="panel"><h2>Decision Draft</h2><p>{draft.length}/2 actions · Resolve in the order shown.</p><ol>{draft.map((id, i) => <li key={id}><strong>{POLICIES[id].name}</strong><div className="row"><button disabled={i === 0} aria-label={`Move ${POLICIES[id].name} up`} onClick={() => { const a = [...draft]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setDraft(a); }}>Move up</button><button aria-label={`Remove ${POLICIES[id].name}`} onClick={() => setDraft(draft.filter((_, j) => j !== i))}>Remove</button></div></li>)}</ol><p>After immediate decisions: treasury {checked!.state.indicators.treasury}{s.mode === 'political' ? `, support ${checked!.state.support}, coordination ${checked!.state.coordination}` : ''}.</p><p>Expenses during this resolution: {obligations(s)}{s.agreement?.pending ? ' (includes conditional delivery)' : ''}. New commitments begin next turn.</p><p>Following-turn obligations after this draft: up to {obligations(checked!.state)}, before any current commitments finish.</p>{checked!.errors.map(e => <p role="alert" key={e}>{e}</p>)}<p role="status">{message}</p><button className="primary" disabled={checked!.errors.length > 0} onClick={() => { const result = reduce(s, { type: 'submitTurn', decisions: draft, blocked: attempts }); if (result.state !== s) {
                setSession({ ...session, current: result.state });
                setDraft([]);
                setAttempts([]);
                setMessage('Turn resolved. Review consequences below.');
            } }}>Submit turn <GameIcon name="forward"/></button></section>
 <section className="panel"><h2>Foreign Affairs</h2><p>Veyra evaluates supply agreements at relations ≥45 on the next turn. A successful agreement delivers immediately on resolution, then twice more.</p><p>{s.agreement ? `${s.agreement.pending ? 'Negotiation pending' : 'Supply agreement active'} · ${s.agreement.remaining} deliveries remaining, 4 treasury each.` : 'No supply agreement pending or active.'}</p><h3>Domestic commitments</h3><p>{s.program ? `Energy program: ${s.program.remaining} payments of 3 remaining; +15 energy on completion.` : 'No domestic energy program active.'}</p></section></div></div>
 </> : <section className="panel"><h2>Your administration: assessment</h2>{assessment(s).map(x => <p key={x}>{x}</p>)}<button className="primary" onClick={() => { setSession({ previous: s, current: createInitialState(s.mode === 'executive' ? 'political' : 'executive') }); setDraft([]); setAttempts([]); setMessage(''); }}>Replay in the other mode</button></section>}
 {session.previous && <section className="panel"><h2>Previous {session.previous.mode} administration</h2>{assessment(session.previous).map(x => <p key={x}>{x}</p>)}<p>Unused decisions: {session.previous.history.reduce((n, h) => n + h.unused, 0)} · Blocked attempts: {session.previous.history.reduce((n, h) => n + h.blocked.length, 0)}</p></section>}
 <section className="panel" aria-live="polite"><h2>Decision timeline</h2>{!s.history.length ? <p>Your administration has not submitted a turn.</p> : [...s.history].reverse().map(h => <details key={h.turn} open={h.turn === s.turn - 1}><summary>Turn {h.turn}: {h.decisions.map(id => POLICIES[id].name).join(', ') || 'No discretionary decisions'}</summary><ul>{h.report.map((r, i) => <li key={i}>{r}</li>)}</ul><p>Unused slots: {h.unused}. Treasury {h.indicators.treasury}; approval {h.indicators.approval}; energy {h.indicators.energy}; relations {h.indicators.relations}.</p>{h.blocked.length > 0 && <p>Blocked attempts: {h.blocked.join(' ')}</p>}</details>)}</section>
 </>}
 <footer className="panel"><p>Government saves are separate. Earlier civilization saves remain untouched in this browser.</p><div className="row"><button onClick={() => { try {
        download(session, blocked);
    }
    catch {
        setError('Export unavailable. Browser storage may be inaccessible.');
    } }}>{blocked ? 'Export original save' : 'Export government save'}</button><label>Import government save <input type="file" accept="application/json,.json" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f)
        return; try {
        const next = decode(await f.text());
        if (confirm('Replace the current government session?')) {
            setSession(next);
            setBlocked(false);
            setDraft([]);
            setAttempts([]);
        }
    }
    catch {
        setError('Invalid government save. Current session unchanged.');
    } }}/></label><button onClick={() => { if (confirm('Return to mode selection? Export your current run first to keep it.')) {
        setSession({ current: null, previous: session.previous });
        setBlocked(false);
        setDraft([]);
        setAttempts([]);
    } }}>Choose mode</button></div></footer>
 </main>;
}
