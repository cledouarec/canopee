// Captures a README screenshot: loads the app, imports an example org,
// waits for the graph to render, and saves a PNG.
// Usage: a preview server must already be running at $BASE_URL (default :4173).
//   node scripts/screenshot.mjs

import { join } from 'node:path';
import { chromium } from '@playwright/test';

const root = join(import.meta.dirname, '..');
const baseUrl = process.env.BASE_URL ?? 'http://localhost:4173';
const example = join(root, 'examples', 'acme-engineering.orga.json');
const out = join(root, 'docs', 'screenshot.png');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(baseUrl);
await page.getByLabel('Import organization file').setInputFiles(example);
await page.getByRole('toolbar').waitFor();
await page.locator('.react-flow').getByText('Checkout').first().waitFor();
// Let React Flow run its fitView animation.
await page.waitForTimeout(1200);

await page.screenshot({ path: out });
await browser.close();
console.log(`Saved ${out}`);
