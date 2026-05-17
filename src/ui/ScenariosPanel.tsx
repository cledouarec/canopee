import { useState } from 'react';
import { CURRENT_SCENARIO_ID } from '@/model/types';
import { useCanopee } from '@/viz/useCanopee';
import styles from './ScenariosPanel.module.css';

export function ScenariosPanel(): JSX.Element {
  const org = useCanopee((s) => s.org);
  const selectedScenarioId = useCanopee((s) => s.selectedScenarioId);
  const addScenario = useCanopee((s) => s.addScenario);
  const deleteScenario = useCanopee((s) => s.deleteScenario);
  const selectScenario = useCanopee((s) => s.selectScenario);
  const [name, setName] = useState('');

  if (!org) return <div data-testid="scenarios-empty" />;

  return (
    <aside aria-label="Scenario manager" className={styles.aside}>
      <h2 className={styles.title}>Scenarios</h2>
      <ul className={styles.list}>
        {org.scenarios.map((s) => (
          <li key={s.id} className={styles.row}>
            <button
              aria-label={`Select scenario ${s.name}`}
              onClick={() => selectScenario(s.id)}
              className={
                s.id === selectedScenarioId ? styles.scenarioBtnActive : styles.scenarioBtn
              }
            >
              {s.name}
            </button>
            {s.id !== CURRENT_SCENARIO_ID && (
              <button
                aria-label={`Delete scenario ${s.name}`}
                onClick={() => deleteScenario(s.id)}
                className={styles.del}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.add}>
        <input
          aria-label="New scenario name"
          value={name}
          placeholder="New scenario…"
          onChange={(e) => setName(e.target.value)}
          className={styles.addInput}
        />
        <button
          aria-label="Add scenario"
          disabled={!name.trim()}
          onClick={() => {
            addScenario(name.trim());
            setName('');
          }}
        >
          +
        </button>
      </div>
    </aside>
  );
}
