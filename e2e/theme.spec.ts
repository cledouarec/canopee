import { expect, test } from '@playwright/test';

test('theme choice persists across reload; SVG export works', async ({ page }) => {
  // Fresh browser context already has empty storage — do NOT clear via
  // addInitScript (it re-runs on reload and would defeat the persistence
  // this test verifies).
  await page.goto('/');

  await page.getByLabel('Organization name').fill('Theme Org');
  await page.getByRole('button', { name: 'Create organization' }).click();
  await expect(page.getByRole('toolbar')).toBeVisible();

  // Sun/moon toggle: from the default light theme the button switches to dark.
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();

  // Wait for the debounced workspace autosave to flush before reloading,
  // otherwise the org would not be restored. Key mirrors
  // src/store/persistence.ts WORKSPACE_KEY.
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('canopee:workspace:v1')))
    .not.toBeNull();

  await page.reload();
  await expect(page.getByRole('toolbar')).toBeVisible();
  // The dark theme persisted, so the button still offers the switch to light.
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();

  await page.getByRole('button', { name: 'Export image' }).click();
  const dialog = page.getByRole('dialog', { name: 'Export image' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Format').selectOption('svg');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'Export', exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
});
