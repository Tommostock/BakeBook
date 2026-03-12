/**
 * Post-build script: injects PWA manifest, apple-touch-icon, theme-color meta,
 * and service-worker registration into every HTML file in dist/.
 * Also copies manifest.json, sw.js, and public/assets into dist/.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
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

// 2. Copy public/assets/ into dist/assets/
function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

const assetsSrc = join(publicDir, 'assets');
const assetsDest = join(DIST, 'assets');
if (existsSync(assetsSrc)) {
  copyDir(assetsSrc, assetsDest);
  console.log('✅  Copied assets/ → dist/assets/');
}

// 3. Inject into HTML files
const MANIFEST_LINK = '<link rel="manifest" href="/manifest.json">';
const THEME_META = '<meta name="theme-color" content="#F8C8DC">';
const APPLE_TOUCH_ICON = '<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png">';
const APPLE_META = [
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="apple-mobile-web-app-title" content="BakeBook">',
].join('\n  ');
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
  if (html.includes('apple-touch-icon')) return;

  // Remove old partial injection if present (manifest only, no apple-touch-icon)
  if (html.includes('rel="manifest"') && !html.includes('apple-touch-icon')) {
    html = html.replace(/\s*<link rel="manifest"[^>]*>\n?/g, '');
    html = html.replace(/\s*<meta name="theme-color"[^>]*>\n?/g, '');
    html = html.replace(/\s*<script>\s*\nif \('serviceWorker'[\s\S]*?<\/script>\n?/g, '');
  }

  // Inject into <head>
  html = html.replace('</head>',
    `  ${MANIFEST_LINK}\n  ${THEME_META}\n  ${APPLE_TOUCH_ICON}\n  ${APPLE_META}\n</head>`
  );

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
