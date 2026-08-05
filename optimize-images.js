/**
 * Image pipeline: every uploaded photo becomes responsive WebP.
 *
 * A landing's first paint is dominated by the hero photo, so source JPEGs are
 * never shipped as-is. For each image we emit WebP at 1920 / 1280 / 800 px and
 * let the browser pick via srcset — a phone downloads ~66 KB where the original
 * JPEG was ~714 KB.
 *
 * The original file stays on disk as the fallback for ancient browsers and as
 * the master copy for re-encoding.
 *
 * Usage:
 *   node optimize-images.js <slug>     — (re)build variants for one project
 *   node optimize-images.js --all      — every project in data/
 */

const fs = require('fs');
const path = require('path');

// Widths we ship, from the design-system media budget
const WIDTHS = [1920, 1280, 800];
const QUALITY = { 1920: 76, 1280: 74, 800: 72 };
// Byte budget per width. Quality alone does not bound file size: a dense
// aerial at q76 lands at 440KB where a calm interior lands at 140KB. Detailed
// shots get their quality stepped down until they fit, so no single photo can
// blow the page budget — and nobody has to hand-tune a file per landing.
const MAX_BYTES = { 1920: 320 * 1024, 1280: 160 * 1024, 800: 90 * 1024 };
const QUALITY_FLOOR = 58;
// Исходники приходят и в webp/avif — их тоже надо привести к нашим
// размерам, иначе страница сошлётся на несуществующий вариант
const SOURCE_RE = /\.(jpe?g|png|webp|avif)$/i;

// Наши собственные результаты не должны попадать на вход повторно:
// иначе появляются hero-1280-800.webp и подобный мусор.
function isOurVariant(file, allFiles) {
  if (!/\.webp$/i.test(file)) return false;
  if (/-(?:800|1280|1920)\.webp$/i.test(file)) return true;
  const base = file.replace(/\.webp$/i, '');
  // hero.webp рядом с hero.jpg — это результат, а не исходник
  return allFiles.some(f => f !== file && f.replace(/\.[a-z0-9]+$/i, '') === base && !/\.webp$/i.test(f));
}

function loadSharp() {
  try { return require('sharp'); } catch (e) { return null; }
}

// hero.jpg -> hero.webp / hero-1280.webp / hero-800.webp
function variantName(file, width, widest) {
  const base = file.replace(SOURCE_RE, '');
  return width === widest ? `${base}.webp` : `${base}-${width}.webp`;
}

async function optimizeFile(sharp, dir, file) {
  const src = path.join(dir, file);
  const meta = await sharp(src).metadata();
  const widths = WIDTHS.filter(w => w <= (meta.width || 0));
  if (!widths.length) widths.push(meta.width || WIDTHS[WIDTHS.length - 1]);
  const widest = widths[0];
  const made = [];
  for (const w of widths) {
    const out = path.join(dir, variantName(file, w, widest));
    // Skip if the variant is already newer than its source
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
      made.push({ file: path.basename(out), width: w, bytes: fs.statSync(out).size, cached: true });
      continue;
    }
    let q = QUALITY[w] || 74;
    let buf = await sharp(src).resize(w).webp({ quality: q }).toBuffer();
    const budget = MAX_BYTES[w];
    while (budget && buf.length > budget && q > QUALITY_FLOOR) {
      q = Math.max(QUALITY_FLOOR, q - 6);
      buf = await sharp(src).resize(w).webp({ quality: q }).toBuffer();
    }
    fs.writeFileSync(out, buf);
    made.push({ file: path.basename(out), width: w, bytes: buf.length, quality: q });
  }
  return made;
}

async function optimizeProject(slug, baseDir) {
  const sharp = loadSharp();
  const dir = path.join(baseDir || path.join(__dirname, 'data'), slug, 'images');
  if (!sharp || !fs.existsSync(dir)) return { slug, skipped: true, reason: sharp ? 'no images dir' : 'sharp unavailable' };
  const all = fs.readdirSync(dir);
  const sources = all.filter(f => SOURCE_RE.test(f) && !isOurVariant(f, all));
  let before = 0, after = 0, count = 0;
  for (const f of sources) {
    before += fs.statSync(path.join(dir, f)).size;
    const made = await optimizeFile(sharp, dir, f);
    // widest variant is what a desktop actually downloads
    after += made[0] ? made[0].bytes : 0;
    count += made.length;
  }
  return { slug, sources: sources.length, variants: count, beforeKB: Math.round(before / 1024), afterKB: Math.round(after / 1024) };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dataDir = path.join(__dirname, 'data');
  const slugs = args.includes('--all')
    ? fs.readdirSync(dataDir).filter(f => fs.existsSync(path.join(dataDir, f, 'images')))
    : args;
  if (!slugs.length) { console.log('Usage: node optimize-images.js <slug> | --all'); process.exit(0); }
  (async () => {
    for (const slug of slugs) {
      const r = await optimizeProject(slug);
      if (r.skipped) console.log(`- ${slug}: ${r.reason}`);
      else console.log(`✓ ${slug}: ${r.sources} исходных → ${r.variants} webp | ${r.beforeKB}KB → ${r.afterKB}KB (десктоп)`);
    }
  })();
}

module.exports = { optimizeProject, optimizeFile, variantName, WIDTHS };
