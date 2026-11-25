import { POLICIES, preview, type State, type PolicyId, type Policy, type Indicators } from '../government/engine';
import { GameIcon } from './GameIcon';
import { policyMeta, indicatorMeta, signed } from './presentation';
export interface DecisionProps {
    state: State;
    draft: PolicyId[];
    onAdd: (id: PolicyId) => void;
}
export function PolicyCards({ ids, state, draft, onAdd }: DecisionProps & {
    ids: PolicyId[];
}) {
    return <div className="policy-grid">{ids.map(id => {
            const p: Policy = POLICIES[id], added = draft.includes(id), reasons = added ? [] : preview(state, [...draft, id]).errors;
            return <article className={`policy-card ${added ? 'selected' : ''}`} key={id}><GameIcon name={policyMeta[id].icon}/><h3>{p.name}</h3><p>{p.description}</p><dl className="effects"><div><dt>Treasury</dt><dd>{p.cost ? `−${p.cost}` : 'No immediate cost'}</dd></div>{(Object.keys(p.effect ?? {}) as (keyof Indicators)[]).map(k => <div key={k}><dt>{indicatorMeta[k].label}</dt><dd>{signed(p.effect![k]!)}</dd></div>)}</dl>{state.mode === 'political' && (p.approval || p.coordination) && <p className="requirements">{p.approval ? 'Needs 60 legislative support; uses 5. ' : ''}{p.coordination ? 'Uses 1 coordination.' : ''}</p>}{reasons.length > 0 && <p className="restriction">{reasons.join(' ')}</p>}<button disabled={added} aria-label={`${added ? 'Added' : 'Draft'} ${p.name}`} onClick={() => onAdd(id)}>{added ? <><GameIcon name="check"/> Added</> : <>+ Add to draft</>}</button></article>;
        })}</div>;
}
