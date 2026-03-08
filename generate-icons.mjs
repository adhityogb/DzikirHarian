import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, copyFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_IMAGE = join(__dirname, '..', '..', '..', '..', '.gemini', 'antigravity', 'brain', 'b5371f87-ba89-464d-97c2-4c97d941e030', 'dzikirharian_logo_1772979550192.png');
const PUBLIC_DIR = join(__dirname, 'public');
const ICONS_DIR = join(PUBLIC_DIR, 'icons');

// Ensure icons directory exists
mkdirSync(ICONS_DIR, { recursive: true });

const sizes = [
  // Web favicons
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  
  // Apple Touch Icons
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-76x76.png', size: 76 },
  { name: 'apple-touch-icon-60x60.png', size: 60 },
  
  // Android / PWA icons
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-256x256.png', size: 256 },
  { name: 'icon-384x384.png', size: 384 },
  
  // MS Tile
  { name: 'mstile-150x150.png', size: 150 },
  
  // General
  { name: 'logo-1024x1024.png', size: 1024 },
];

async function generateIcons() {
  console.log('🎨 Generating DzikirHarian icons from source image...\n');
  
  for (const { name, size } of sizes) {
    const outputPath = join(ICONS_DIR, name);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    console.log(`  ✅ ${name} (${size}x${size})`);
  }
  
  // Also copy the main icons to public root for convenience
  const rootCopies = [
    { from: 'apple-touch-icon.png', to: join(PUBLIC_DIR, 'apple-touch-icon.png') },
    { from: 'favicon-32x32.png', to: join(PUBLIC_DIR, 'favicon-32x32.png') },
    { from: 'favicon-16x16.png', to: join(PUBLIC_DIR, 'favicon-16x16.png') },
  ];
  
  console.log('\n📋 Copying key icons to public root...');
  for (const { from, to } of rootCopies) {
    copyFileSync(join(ICONS_DIR, from), to);
    console.log(`  ✅ ${from} → public/`);
  }
  
  console.log('\n🎉 All icons generated successfully!');
  console.log(`\n📁 Icons directory: ${ICONS_DIR}`);
  console.log(`📊 Total icons generated: ${sizes.length}`);
}

generateIcons().catch(console.error);
