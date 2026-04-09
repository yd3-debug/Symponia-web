// ── Symponia App Store Screenshot Capture ─────────────────────────────────────
// Renders each HTML template at 1290×2796px (iPhone 6.7" App Store size)
// Output: screenshots/output/*.png  — ready to upload to App Store Connect

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENS = [
  { file: '01-hero',         label: 'Hero — Not a chatbot. A presence.' },
  { file: '02-animals',      label: 'Animals — Your soul\'s fingerprint' },
  { file: '03-oracle',       label: 'Oracle — Three depths. One presence.' },
  { file: '04-soul-map',     label: 'Soul Map — Seven voices. One truth.' },
  { file: '05-modes',        label: 'Modes — Begin anywhere.' },
];

// iPhone 6.7" App Store screenshot dimensions
const WIDTH  = 1290;
const HEIGHT = 2796;

async function capture() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('\n◈  Symponia — App Store Screenshot Capture');
  console.log('─'.repeat(52));
  console.log(`   Size: ${WIDTH} × ${HEIGHT}px (iPhone 6.7")\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const screen of SCREENS) {
    const page = await browser.newPage();

    await page.setViewport({
      width:             WIDTH,
      height:            HEIGHT,
      deviceScaleFactor: 1,
    });

    const filePath = path.resolve(__dirname, `${screen.file}.html`);
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Allow Google Fonts and animations to settle
    await new Promise(r => setTimeout(r, 1200));

    const outputPath = path.join(outputDir, `${screen.file}.png`);
    await page.screenshot({ path: outputPath, fullPage: false });

    console.log(`   ✓  ${screen.label}`);
    await page.close();
  }

  await browser.close();

  console.log('\n─'.repeat(52));
  console.log(`   Saved to: screenshots/output/\n`);
}

capture().catch(err => {
  console.error('\n✗  Capture failed:', err.message);
  process.exit(1);
});
