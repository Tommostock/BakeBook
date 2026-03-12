/**
 * Post-build script: injects PWA manifest, theme-color meta, and
 * service-worker registration into every HTML file in dist/.
 * Also copies manifest.json and sw.js into dist/.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const DIST = resolve('dist');

if (!existsSync(DIST)) {
  console.error('❌  dist/ folder not found — run "npx expo export --platform web" first.');
  process.exit(1);
}

// 1. Copy manifest.json + sw.js into dist/
const publicDir = resolve('public');
for (const file of ['manifest.json', 'sw.js']) {
  const src = join(publicDir, file);
  const dest = join(DIST, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`✅  Copied ${file} → dist/`);
  } else {
    console.warn(`⚠️  ${file} not found in public/`);
  }
}

// 2. Inject into HTML files
const MANIFEST_LINK = '<link rel="manifest" href="/manifest.json">';
const THEME_META = '<meta name="theme-color" content="#F8C8DC">';
const SW_SCRIPT = `
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
</script>`;

function processHTML(filePath) {
  let html = readFileSync(filePath, 'utf-8');

  // Skip if already injected
  if (html.includes('rel="manifest"')) return;

  // Inject into <head>
  html = html.replace('</head>', `  ${MANIFEST_LINK}\n  ${THEME_META}\n</head>`);

  // Inject SW registration before </body>
  html = html.replace('</body>', `${SW_SCRIPT}\n</body>`);

  writeFileSync(filePath, html, 'utf-8');
  console.log(`✅  Injected PWA tags into ${filePath}`);
}

// Walk dist/ for .html files
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) processHTML(full);
  }
}

walk(DIST);
console.log('\n🎉  PWA injection complete!');
