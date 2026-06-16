const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const OUTPUT_DIR = path.join(IMAGES_DIR, 'web');
const MIN_SIZE_BYTES = 1024 * 1024; // 1 MB

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

const SUPPORTED = ['.jpg', '.jpeg', '.png'];

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

async function processImages() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const files = fs.readdirSync(IMAGES_DIR);
  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!SUPPORTED.includes(ext)) continue;

    const inputPath = path.join(IMAGES_DIR, file);
    const stat = fs.statSync(inputPath);

    if (stat.size < MIN_SIZE_BYTES) {
      console.log(`  skip  ${file}  (${formatKB(stat.size)} — under 1 MB)`);
      skipped++;
      continue;
    }

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
    console.log(
      `  ✓  ${file}  →  web/${basename}.webp` +
      `  (${formatKB(stat.size)} → ${formatKB(outStat.size)},  ${s.width}px wide,  [${s.label}])`
    );
    processed++;
  }

  console.log(`\n  Done: ${processed} compressed, ${skipped} skipped.\n`);
}

console.log('\nCompressing images...\n');
processImages().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
