import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const fixture = join(import.meta.dirname, 'fixtures', 'sample.orga.json');

test('import an org, see the graph, export it back to JSON', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/');

  await expect(page.getByTestId('welcome')).toBeVisible();
  await page.getByLabel('Import organization file').setInputFiles(fixture);

  await expect(page.getByRole('toolbar')).toBeVisible();
  // Scope to the React Flow canvas so this fails on a blank-graph regression
  // (the team names also appear in side panels).
  const canvas = page.locator('.react-flow');
  await expect(canvas.getByText('Checkout')).toBeVisible();
  await expect(canvas.getByText('Platform')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export', exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.orga\.json$/);
});
