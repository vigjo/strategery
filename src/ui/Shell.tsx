import { useEffect, useRef, type ReactNode } from 'react';
import { GameIcon, type IconName } from './GameIcon';
import { indicatorDeltas, indicatorMeta, signed } from './presentation';
import type { State, Indicators } from '../government/engine';
export type View = 'Briefing' | 'Cabinet' | 'Foreign Affairs' | 'History';
export function Emblem() { return <svg className="emblem" viewBox="0 0 64 72" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 13h32v25c0 13-16 22-16 22S16 51 16 38z M22 29l10-8 10 8-10 17z M32 4v10M27 9h10M10 18C-1 39 10 59 27 65M54 18c11 21 0 41-17 47M5 28l7 4M5 40l8 3M10 52l8 1M59 28l-7 4M59 40l-8 3M54 52l-8 1"/></svg>; }
export function Indicators({ state }: {
    state: State;
}) { const changes = indicatorDeltas(state); return <section className="indicators" aria-label="Country">{(Object.keys(indicatorMeta) as (keyof Indicators)[]).map(key => <div className={`indicator ${key}`} key={key}><GameIcon name={indicatorMeta[key].icon}/><div><span>{indicatorMeta[key].label}</span><strong>{state.indicators[key]}</strong>{changes && <small title="Change during the last resolved turn">{signed(changes[key])} last turn</small>}</div></div>)}</section>; }
export function Navigation({ view, onChange }: {
    view: View;
    onChange: (v: View) => void;
}) { const items: Record<View, IconName> = { Briefing: 'document', Cabinet: 'cabinet', 'Foreign Affairs': 'diplomacy', History: 'library' }; return <nav className="navigation" aria-label="Government views">{(Object.keys(items) as View[]).map(v => <button key={v} aria-current={v === view ? 'page' : undefined} onClick={() => onChange(v)}><GameIcon name={items[v]}/>{v}</button>)}<p className="nav-motto">Public service.<br />Private deliberation.</p></nav>; }
export function Modal({ label, children, onClose, returnFocusId }: {
    returnFocusId: string;
    label: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => { dialog.close(); requestAnimationFrame(() => { if (!dialog.isConnected) document.getElementById(returnFocusId)?.focus(); }); }; }, [returnFocusId]);
    return <dialog ref={ref} className="overlay" aria-label={label} onCancel={e => { e.preventDefault(); onClose(); }}><div className="overlay-header"><span>{label}</span><button onClick={onClose} aria-label={`Close ${label}`}>Close ×</button></div>{children}</dialog>;
}


