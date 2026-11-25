import { POLICIES, preview, obligations, type State, type PolicyId, type Indicators } from '../government/engine';
import { indicatorMeta, signed } from './presentation';
import { GameIcon } from './GameIcon';
export function DecisionTray({ state, draft, setDraft, message, onSubmit }: {
    state: State;
    draft: PolicyId[];
    setDraft: (a: PolicyId[]) => void;
    message: string;
    onSubmit: () => void;
}) {
    const checked = preview(state, draft);
    return <section className="decision-tray" aria-label="Decision Draft"><div className="section-heading"><h2>This turn</h2><span>{draft.length} of 2 decisions</span></div><ol className="draft-slots">{[0, 1].map(i => <li key={i}><span className="slot-number">0{i + 1}</span>{draft[i] ? <div><strong>{POLICIES[draft[i]].name}</strong><div className="slot-controls"><button disabled={i === 0} aria-label={`Move ${POLICIES[draft[i]].name} up`} onClick={() => setDraft([draft[1], draft[0]])}>↑ Move up</button><button aria-label={`Remove ${POLICIES[draft[i]].name}`} onClick={() => setDraft(draft.filter((_, j) => j !== i))}>Remove</button></div></div> : <span className="muted">Choose a cabinet decision</span>}</li>)}</ol>
 <h3>Immediate draft effects</h3><dl className="effects">{(Object.keys(indicatorMeta) as (keyof Indicators)[]).map(k => <div key={k}><dt><GameIcon name={indicatorMeta[k].icon}/>{indicatorMeta[k].label}</dt><dd>{signed(checked.state.indicators[k] - state.indicators[k])}</dd></div>)}</dl><p className="projected">Projected treasury <strong>{checked.state.indicators.treasury}</strong></p>{state.mode === 'political' && <div className="institution"><p>Legislative support <strong>{checked.state.support}/100</strong></p><p>Cabinet coordination <strong>{checked.state.coordination}/3</strong></p><div className="coordination" aria-hidden="true">{[1, 2, 3].map(n => <span key={n} className={n <= checked.state.coordination ? 'filled' : ''}/>)}</div></div>}
 <details className="obligations"><summary>Recurring obligations</summary><p>This resolution: {obligations(state)} treasury{state.agreement?.pending ? ' including a conditional delivery' : ''}. Revenue: +10.</p><p>Following turn: up to {obligations(checked.state)} before current commitments finish. New commitments begin next turn.</p><p>Draft effects above exclude recurring costs, income, and end-of-turn consequences.</p></details>{checked.errors.map(e => <p className="restriction" role="alert" key={e}>{e}</p>)}{message && <p className="notice" role="status">{message}</p>}<button className="submit" disabled={checked.errors.length > 0} onClick={onSubmit}><GameIcon name="cabinet"/> Submit turn <GameIcon name="forward"/></button><small className="submit-help">Review your decisions before submitting.</small></section>;
}
