const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Sources live in images/originals (gitignored); compressed output lands in
// images/ (committed, and what index.html references). Keeping them in
// separate directories means a re-run never re-compresses its own output.
const OUTPUT_DIR = path.join(__dirname, '..', 'images');
const SOURCE_DIR = path.join(OUTPUT_DIR, 'originals');

const SETTINGS = {
  hero:    { width: 1920, quality: 83, label: 'hero'    },
  about:   { width: 900,  quality: 87, label: 'about'   },
  default: { width: 800,  quality: 87, label: 'default' },
};

// _hq override for fine-texture subjects (brick, fur, fabric).
// Detail loss is mostly from downscaling, so _hq raises resolution AND
// quality, and applies a light sharpen to restore crispness lost on resize.
const HQ_QUALITY = 92;
const HQ_MIN_WIDTH = 1600;

const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic'];

function getSettings(basename) {
  const lower = basename.toLowerCase();
  const hq = lower.includes('_hq');
  let s;
  if (lower.includes('_hero'))       s = { ...SETTINGS.hero };
  else if (lower.includes('_about')) s = { ...SETTINGS.about };
  else                               s = { ...SETTINGS.default };
  if (hq) {
    s.quality = HQ_QUALITY;
    s.width   = Math.max(s.width, HQ_MIN_WIDTH);
    s.sharpen = true;
    s.label   = s.label + '+hq';
  }
  return s;
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB';
}

function formatDelta(inBytes, outBytes) {
  const pct = ((outBytes - inBytes) / inBytes) * 100;
  return (pct > 0 ? '+' : '') + pct.toFixed(0) + '%';
}

async function processImages() {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  const files = fs.readdirSync(SOURCE_DIR);
  let processed = 0;
  let grew = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!SUPPORTED.includes(ext)) continue;

    const inputPath = path.join(SOURCE_DIR, file);
    const stat = fs.statSync(inputPath);
    const basename = path.basename(file, ext);
    const outputPath = path.join(OUTPUT_DIR, basename + '.webp');
    const s = getSettings(basename);

    let pipeline = sharp(inputPath)
      .resize({ width: s.width, withoutEnlargement: true });
    if (s.sharpen) {
      pipeline = pipeline.sharpen({ sigma: 0.8 });
    }
    await pipeline
      .webp({ quality: s.quality })
      .toFile(outputPath);

    const outStat = fs.statSync(outputPath);
    // An already-optimized source can re-encode larger; flag it rather than
    // skipping, so every input still produces an output to reference.
    const bigger = outStat.size > stat.size;
    if (bigger) grew++;
    console.log(
      `  ${bigger ? '!' : '✓'}  ${file}  →  ${basename}.webp` +
      `  (${formatKB(stat.size)} → ${formatKB(outStat.size)},  ${formatDelta(stat.size, outStat.size)},` +
      `  ${s.width}px wide,  [${s.label}])`
    );
    processed++;
  }

  if (processed === 0) {
    console.log('  No source images found in images/originals/.');
    return;
  }

  console.log(
    `\n  Done: ${processed} compressed` +
    `${grew ? `, ${grew} larger than source (marked !)` : ''}.\n`
  );
}

console.log('\nCompressing images...\n');
processImages().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
