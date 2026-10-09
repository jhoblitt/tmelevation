// Development only, not run in CI: full-page screenshots of both pages at
// phone and desktop sizes for a visual check, written to
// $TMPDIR/tmelevation-shots/. Needs Google Chrome (see test/browser/cdp.mjs).
//
//   node scripts/screenshots.mjs [siteDir]      (default: site/)
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../test/browser/cdp.mjs';
import { serve } from '../test/browser/serve.mjs';

const SITE = process.argv[2] ?? fileURLToPath(new URL('../site/', import.meta.url));
const OUT = join(tmpdir(), 'tmelevation-shots');
const SIZES = [
  [320, 568],
  [375, 667],
  [390, 844],
  [844, 390],
  [1440, 900],
];
const ELEVATIONS_FT = [0, 5280];
const MODES = ['abs', 'pct'];
const FRAMES =
  'new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())))';
// Chrome cannot capture an image much taller than its maximum texture size
// (the methods page at 320 px is ~38,000 device pixels), so a tall page is
// written as numbered parts.
const PART_PX = 8192;

// A capture beyond the viewport leaves a table scroller far below it
// unpainted, so the viewport is stretched over the whole page instead. The
// page has no viewport-height units, so only its height changes.
async function shoot(page, name, device) {
  const { cssContentSize } = await page.send('Page.getLayoutMetrics');
  const height = Math.ceil(cssContentSize.height);
  await page.send('Emulation.setDeviceMetricsOverride', { ...device, height });
  await page.eval(FRAMES);
  const part = Math.floor(PART_PX / device.deviceScaleFactor);
  const parts = Math.ceil(height / part);
  for (let i = 0; i < parts; i += 1) {
    const y = i * part;
    const { data } = await page.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y, width: device.width, height: Math.min(part, height - y), scale: 1 },
    });
    const path = join(OUT, parts === 1 ? `${name}.png` : `${name}-${i + 1}.png`);
    writeFileSync(path, Buffer.from(data, 'base64'));
    console.log(path);
  }
  await page.emulate(device);
  await page.eval(FRAMES);
}

async function open(page, url) {
  await page.goto(url);
  await page.waitFor(`document.documentElement.dataset.state !== 'loading'`, 60000);
  await page.eval(`document.fonts.ready.then(() => ${FRAMES})`);
}

mkdirSync(OUT, { recursive: true });
const server = await serve(SITE);
const browser = await launch();
try {
  for (const [width, height] of SIZES) {
    const size = `${width}x${height}`;
    const mobile = width < 1024;
    const device = { width, height, mobile, deviceScaleFactor: mobile ? 2 : 1 };
    const page = await browser.newPage();
    await page.emulate(device);
    await open(page, `${server.url}/index.html`);
    for (const feet of ELEVATIONS_FT) {
      for (const mode of MODES) {
        await page.eval(`(() => {
          const slider = document.getElementById('slider');
          slider.value = '${feet}';
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          document.getElementById('mode-${mode}').click();
        })()`);
        await page.eval(FRAMES);
        await shoot(page, `index-${size}-${feet}ft-${mode}`, device);
      }
    }
    await open(page, `${server.url}/methods.html`);
    await shoot(page, `methods-${size}`, device);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
