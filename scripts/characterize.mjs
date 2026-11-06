// Records what the page shows for fixed inputs, so two versions can be compared.
// Usage: node scripts/characterize.mjs <url> <output.json>
// Needs Playwright, which is NOT a project dependency: this is an evidence tool, not part of npm test.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");

const [url, outFile] = process.argv.slice(2);
const cases = [
  ["touching end", "11:00", "12:00"],
  ["touching start", "09:30", "10:00"],
  ["overlap", "10:30", "11:30"],
  ["inside existing", "10:15", "10:45"],
  ["covers existing", "09:50", "11:10"],
  ["exactly 120", "12:00", "14:00"],
  ["121 minutes", "12:00", "14:01"],
  ["starts at now", "09:00", "09:30"],
  ["before now", "08:00", "08:30"],
  ["reversed", "12:00", "11:00"],
  ["zero length", "12:00", "12:00"],
  ["empty start", "", "12:00"],
  ["empty end", "12:00", ""],
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url);
await page.waitForSelector("#check-btn");
// The original page needs no room choice; the catalog page does. Room 301 keeps the original data.
const room301 = page.locator('input[name="room"][value="R301"]');
if (await room301.count()) await room301.check();

const results = [];
for (const [name, start, end] of cases) {
  await page.fill("#start-time", start);
  await page.fill("#end-time", end);
  await page.click("#check-btn");
  results.push({
    name, start, end,
    state: (await page.getAttribute("#result", "class")).replace("result", "").trim(),
    title: await page.textContent("#result-title"),
    message: await page.textContent("#result-message"),
  });
}
await browser.close();
writeFileSync(outFile, JSON.stringify(results, null, 2) + "\n");
console.log(`${results.length} cases written to ${outFile}`);
