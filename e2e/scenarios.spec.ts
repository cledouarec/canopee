import { expect, test } from '@playwright/test';

test('create a scenario, open comparison, export the summary', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/');

  await page.getByLabel('Organization name').fill('E2E Org');
  // Scope to the welcome dialog: a toolbar "Frameworks" button shares the
  // 'Framework' accessible-name prefix and would make this ambiguous.
  await page.getByTestId('welcome').getByLabel('Framework').selectOption('team-topologies');
  await page.getByRole('button', { name: 'Create organization' }).click();
  await expect(page.getByRole('toolbar')).toBeVisible();

  await page.getByRole('button', { name: 'Scenarios' }).click();
  await page.getByLabel('New scenario name').fill('Q3 Reorg');
  await page.getByRole('button', { name: 'Add scenario' }).click();
  await expect(page.getByRole('button', { name: 'Select scenario Q3 Reorg' })).toBeVisible();

  await page.getByRole('button', { name: 'Comparison' }).click();
  await expect(page.getByLabel('Comparison summary')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export summary' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('comparison.txt');
});
