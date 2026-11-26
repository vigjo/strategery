import { useEffect, useState } from 'react';
import { preview, reduce, createInitialState, type Mode, type PolicyId } from '../government/engine';
import { load, save, decode, download } from '../government/persist';
import { Emblem, Indicators, Navigation, Modal, type View } from './Shell';
import { GovernmentView } from './GovernmentView';
import { DecisionTray } from './DecisionTray';
export function App() {
    const [initial] = useState(load), [session, setSession] = useState(initial.session), [blocked, setBlocked] = useState(!!initial.error), [error, setError] = useState(initial.error);
    const [draft, setDraft] = useState<PolicyId[]>([]), [attempts, setAttempts] = useState<string[]>([]), [message, setMessage] = useState('');
    const [view, setView] = useState<View>('Briefing'), [menu, setMenu] = useState(false), [sheet, setSheet] = useState(false);
    const s = session.current, active = !!s && s.turn <= 12 && !blocked;
    useEffect(() => { if (!blocked)
        setError(save(session)); }, [session, blocked]);
    useEffect(() => { const media = matchMedia('(min-width: 760px)'); const close = () => { if (media.matches)
        setSheet(false); }; media.addEventListener('change', close); return () => media.removeEventListener('change', close); }, []);
    function clearDraft() { setDraft([]); setAttempts([]); setMessage(''); setSheet(false); }
    function start(mode: Mode) { setSession({ ...session, current: createInitialState(mode) }); clearDraft(); setBlocked(false); setView('Briefing'); }
    function add(id: PolicyId) { const errors = draft.length >= 2 ? ['Both decision slots are occupied.'] : preview(s!, [...draft, id]).errors; if (errors.length) {
        setMessage(errors.join(' '));
        setAttempts(a => [...a, ...errors]);
        return;
    } setDraft([...draft, id]); setMessage(`${id.replaceAll('_', ' ')} added to your decision draft.`); }
    function submit() { if (!s)
        return; const result = reduce(s, { type: 'submitTurn', decisions: draft, blocked: attempts }); if (result.state !== s) {
        setSession({ ...session, current: result.state });
        clearDraft();
        setView(result.state.turn > 12 ? 'History' : 'Briefing');
        setMessage('Turn resolved. Review the latest briefing.');
    } }
    function replay() { if (!s)
        return; setSession({ previous: s, current: createInitialState(s.mode === 'executive' ? 'political' : 'executive') }); clearDraft(); setView('Briefing'); }
    const tray = s ? <DecisionTray state={s} draft={draft} setDraft={setDraft} message={message} onSubmit={submit}/> : null;
    return <div className={`situation-room ${active ? 'is-active' : ''}`}><nav className="library-bar" aria-label="Game library"><a href="https://games.joevig.com/"><span aria-hidden="true">‹</span> Game library</a></nav>
<header className="masthead"><div className="brand"><Emblem /><div><span>Strategery</span><small>Republic of Belvar</small></div></div>{s && !blocked && <Indicators state={s}/>}<div className="header-controls">{s && !blocked && <p className="turn-label">{s.mode === 'executive' ? 'Executive' : 'Political'} government · {s.turn <= 12 ? `Turn ${s.turn} / 12` : 'Assessment'}</p>}<button id="game-menu-trigger" aria-haspopup="dialog" onClick={() => setMenu(true)}>Game menu</button></div></header>
 {error && <div className="global-notice" role="alert">{error}</div>}
 {blocked ? <main className="welcome"><p className="eyebrow">Save recovery</p><h1>Your original save is safe.</h1><p>Open the Game menu to export the original, import a valid save, or explicitly start over.</p></main> : !s ? <main className="welcome"><p className="eyebrow">An exercise in governing</p><h1>A country to lead.<br />A crisis to manage.</h1><p className="lede">Belvar has elected you. Veyra has sent congratulations—and a revised energy invoice.</p><div className="mode-grid"><article><span className="category">01 / Executive</span><h2>The authority to act.</h2><p>Your cabinet executes valid decisions. Balance public confidence, resources, and diplomacy through a 12-turn crisis.</p><button onClick={() => start('executive')}>Start Executive →</button></article><article><span className="category">02 / Political</span><h2>The art of agreement.</h2><p>The same crisis, with legislative support and cabinet coordination. Build the backing to turn decisions into policy.</p><button onClick={() => start('political')}>Start Political →</button></article></div><small>One scenario. Two modes. No universal victory score.</small></main> : <div className={`workspace ${active ? '' : 'completed'}`}><Navigation view={s.turn > 12 ? 'History' : view} onChange={v => setView(v)}/><main className="main-content"><GovernmentView view={s.turn > 12 ? 'History' : view} state={s} draft={draft} onAdd={add} previous={session.previous} replay={replay} onNavigate={setView}/></main>{active && <aside className="desktop-tray">{tray}</aside>}</div>}
 <div className="sr-only" role="status">{message}</div>
 {active && <div className="mobile-draft-bar"><span>{draft.length} / 2 decisions</span><button id="review-draft-trigger" aria-haspopup="dialog" onClick={() => setSheet(true)}>Review draft</button></div>}
 {sheet && active && <Modal returnFocusId="review-draft-trigger" label="Decision draft" onClose={() => setSheet(false)}>{tray}</Modal>}
 {menu && <Modal returnFocusId="game-menu-trigger" label="Game menu" onClose={() => setMenu(false)}><p>Government saves are separate. Earlier civilization saves remain untouched.</p><div className="game-controls"><button onClick={() => { try {
        download(session, blocked);
    }
    catch {
        setError('Export unavailable. Browser storage may be inaccessible.');
    } }}>{blocked ? 'Export original save' : 'Export government save'}</button><label>Import government save<input type="file" accept="application/json,.json" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f)
        return; try {
        const next = decode(await f.text());
        if (confirm('Replace the current government session?')) {
            setSession(next);
            setBlocked(false);
            clearDraft();
            setView('Briefing');
            setMenu(false);
        }
    }
    catch {
        setError('Invalid government save. Current session unchanged.');
    } }}/></label><button onClick={() => { if (confirm(blocked ? 'Replace the unreadable government save? Export it first to preserve a copy.' : 'Return to mode selection? Export your current run first to keep it.')) {
        setSession({ current: null, previous: blocked ? null : session.previous });
        setBlocked(false);
        clearDraft();
        setMenu(false);
    } }}>{blocked ? 'Start over' : 'Choose mode'}</button></div>{error && <p role="alert">{error}</p>}</Modal>}
 </div>;
}

