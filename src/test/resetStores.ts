import { canopeeStore } from '@/store';
import { themeStore } from '@/theme/useTheme';
import { viewPrefsStore } from '@/viz/useViewPrefs';
import { DEFAULT_VIEW_PREFS } from '@/viz/viewPrefs';

/**
 * Reset the production singleton stores so test suites are order-independent.
 * Call from `afterEach` in any suite that mutates a shared store.
 */
export function resetStores(): void {
  canopeeStore.setState({
    org: null,
    selectedScenarioId: 'current',
    selectedEntity: null,
    dirty: false,
    canUndo: false,
    canRedo: false,
  });
  themeStore.getState().selectBuiltin('sage-light');
  viewPrefsStore.setState({ prefs: { ...DEFAULT_VIEW_PREFS } });
}
