import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { FRAMEWORKS } from '@/frameworks';
import { useCanopee } from '@/viz/useCanopee';
import { OrgParseError } from '@/serialization/serialize';
import prim from './styles/primitives.module.css';
import s from './WelcomeScreen.module.css';

export interface WelcomeScreenProps {
  /** When an org is already loaded the picker is a cancellable modal (the
   *  current content stays visible behind it). Without an org it is mandatory. */
  dismissible?: boolean;
  /** Close the picker without changing the org (cancel / after create/import). */
  onDismiss?: () => void;
}

export function WelcomeScreen({
  dismissible = false,
  onDismiss,
}: WelcomeScreenProps = {}): JSX.Element {
  const newOrg = useCanopee((s) => s.newOrg);
  const importOrg = useCanopee((s) => s.importOrg);
  const [name, setName] = useState('');
  const [frameworkId, setFrameworkId] = useState(FRAMEWORKS[0]?.id ?? 'custom');
  const [errors, setErrors] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  // Keep focus on the popup: focus the first field on open, and let Escape
  // cancel it (only when an org is loaded behind — otherwise it's mandatory).
  useEffect(() => {
    nameRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!dismissible) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onDismiss?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismissible, onDismiss]);

  function readText(file: File): Promise<string> {
    // `File.text()` is not implemented by every environment's jsdom; fall back
    // to FileReader (browsers use the faster native path when present).
    if (typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('File read failed.'));
      reader.readAsText(file);
    });
  }

  function createOrg(): void {
    newOrg(name.trim(), frameworkId);
    onDismiss?.();
  }

  async function onImport(file: File): Promise<void> {
    setErrors([]);
    try {
      const text = await readText(file);
      importOrg(text);
      onDismiss?.();
    } catch (e) {
      if (e instanceof OrgParseError) {
        setErrors(e.issues.map((i) => `${i.path}: ${i.message}`));
      } else {
        setErrors([(e as Error).message]);
      }
    }
  }

  return (
    <div
      data-testid="welcome"
      role="dialog"
      aria-modal="true"
      aria-label="Project picker"
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onDismiss?.();
      }}
      className={s.scrim}
    >
      <div className={s.dialog}>
        <div className={s.header}>
          <h1 className={s.appTitle}>Canopée</h1>
          {dismissible && (
            <button aria-label="Cancel" onClick={() => onDismiss?.()} className={s.cancel}>
              ✕
            </button>
          )}
        </div>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>New organization</h2>
          <label className={s.label}>
            Organization name
            <input
              ref={nameRef}
              aria-label="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${prim.pillSelect} ${prim.field}`}
            />
          </label>
          <label className={s.label}>
            Framework
            <select
              aria-label="Framework"
              value={frameworkId}
              onChange={(e) => setFrameworkId(e.target.value)}
              className={prim.pillSelect}
            >
              {FRAMEWORKS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <button disabled={!name.trim()} onClick={createOrg} className={s.createBtn}>
            <Plus size={16} aria-hidden />
            Create organization
          </button>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Import</h2>
          <input
            aria-label="Import organization file"
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
            }}
            className={prim.pillSelect}
          />
          {errors.length > 0 && (
            <ul data-testid="import-errors" className={s.errors}>
              {errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
