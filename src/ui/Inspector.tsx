import { useEffect, useState } from 'react';
import type { Team } from '@/model/types';
import { useCanopee } from '@/viz/useCanopee';
import { InsightsPanel } from './InsightsPanel';
import s from './Inspector.module.css';
import prim from './styles/primitives.module.css';

export function Inspector(): JSX.Element {
  const org = useCanopee((s) => s.org);
  const selectedEntity = useCanopee((s) => s.selectedEntity);
  const upsertTeam = useCanopee((s) => s.upsertTeam);

  const team =
    org && selectedEntity?.kind === 'team'
      ? org.teams.find((t) => t.id === selectedEntity.id)
      : undefined;

  // Local draft so typing does not push one undo entry per keystroke; the
  // edit is committed to the store on blur. Re-seeded when the selection
  // changes.
  const [draft, setDraft] = useState<Team | undefined>(team);
  useEffect(() => {
    setDraft(team);
  }, [team?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (): void => {
    if (draft) upsertTeam(draft);
  };

  return (
    <aside className={s.aside}>
      <section className={s.block}>
        <h2 className={s.sectionTitle}>Insights</h2>
        <InsightsPanel />
      </section>

      <hr className={s.divider} />

      <section className={s.block}>
        <h2 className={s.sectionTitle}>Inspector</h2>
        {!draft ? (
          <p className={s.empty}>Select a team to edit its details.</p>
        ) : (
          <form onSubmit={(e) => e.preventDefault()} className={s.form}>
            <label className={s.label}>
              Team name
              <input
                aria-label="Team name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                onBlur={commit}
                className={prim.pillSelect}
              />
            </label>
            <label className={s.label}>
              Mission
              <input
                aria-label="Mission"
                value={draft.mission ?? ''}
                onChange={(e) => setDraft({ ...draft, mission: e.target.value })}
                onBlur={commit}
                className={prim.pillSelect}
              />
            </label>
            <label className={s.label}>
              Scope
              <input
                aria-label="Scope"
                value={draft.scope ?? ''}
                onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                onBlur={commit}
                className={prim.pillSelect}
              />
            </label>
          </form>
        )}
      </section>
    </aside>
  );
}
