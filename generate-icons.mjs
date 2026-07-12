// Run once: node generate-icons.mjs
// Requires: npm install --save-dev sharp
import sharp from 'sharp';

const SIZE = 512;
const H = SIZE / 2; // 256

const C = {
  cardio:   '#60A5FA',  // bright blue
  strength: '#F87171',  // bright red
  stretch:  '#34D399',  // bright green
  balance:  '#A78BFA',  // bright purple
};
const TINT = '55'; // ~33% tint — more vivid quadrant backgrounds

// Each symbol is centered in a 256×256 quadrant.
// We define them in 0,0 space then translate.
// Symbol drawing area: ~140×140 centered at (128,128)

// ❤️ Heart — cardio (top-left, offset 0,0)
const heart = `
  <g transform="translate(0,0)">
    <path d="M128 185 C128 185 60 140 60 95
             A38 38 0 0 1 128 78
             A38 38 0 0 1 196 95
             C196 140 128 185 128 185 Z"
          fill="${C.cardio}"/>
  </g>`;

// 🏋️ Dumbbell — strength (top-right, offset 256,0)
const dumbbell = `
  <g transform="translate(256,0)">
    <!-- bar -->
    <rect x="68" y="120" width="120" height="16" rx="8" fill="${C.strength}"/>
    <!-- left weight plates -->
    <rect x="55" y="100" width="20" height="56" rx="6" fill="${C.strength}"/>
    <rect x="40" y="108" width="18" height="40" rx="5" fill="${C.strength}" opacity="0.75"/>
    <!-- right weight plates -->
    <rect x="181" y="100" width="20" height="56" rx="6" fill="${C.strength}"/>
    <rect x="198" y="108" width="18" height="40" rx="5" fill="${C.strength}" opacity="0.75"/>
  </g>`;

// 🌿 Leaf — stretch (bottom-left, offset 0,256)
const leaf = `
  <g transform="translate(0,256)">
    <path d="M128 175 C128 175 68 148 68 95
             C68 68 95 55 128 55
             C161 55 188 68 188 95
             C188 148 128 175 128 175 Z"
          fill="${C.stretch}"/>
    <!-- stem -->
    <line x1="128" y1="175" x2="128" y2="205"
          stroke="${C.stretch}" stroke-width="10" stroke-linecap="round"/>
    <!-- midrib -->
    <line x1="128" y1="95" x2="128" y2="175"
          stroke="white" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
  </g>`;

// ⚖️ Balance scale — balance (bottom-right, offset 256,256)
const scale = `
  <g transform="translate(256,256)">
    <!-- post -->
    <rect x="122" y="80" width="12" height="100" rx="6" fill="${C.balance}"/>
    <!-- base -->
    <rect x="88" y="178" width="80" height="14" rx="7" fill="${C.balance}"/>
    <!-- beam -->
    <rect x="60" y="108" width="136" height="10" rx="5" fill="${C.balance}"/>
    <!-- left pan string -->
    <line x1="72" y1="118" x2="72" y2="148" stroke="${C.balance}" stroke-width="5"/>
    <!-- right pan string -->
    <line x1="184" y1="118" x2="184" y2="148" stroke="${C.balance}" stroke-width="5"/>
    <!-- left pan -->
    <path d="M50 148 Q72 162 94 148" stroke="${C.balance}" stroke-width="7"
          fill="none" stroke-linecap="round"/>
    <!-- right pan -->
    <path d="M162 148 Q184 162 206 148" stroke="${C.balance}" stroke-width="7"
          fill="none" stroke-linecap="round"/>
    <!-- top pivot circle -->
    <circle cx="128" cy="106" r="10" fill="${C.balance}"/>
  </g>`;

const svg = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="#0F172A"/>

  <!-- Quadrant tints -->
  <rect x="0"   y="0"   width="${H}" height="${H}" fill="${C.cardio}${TINT}"/>
  <rect x="${H}" y="0"   width="${H}" height="${H}" fill="${C.strength}${TINT}"/>
  <rect x="0"   y="${H}" width="${H}" height="${H}" fill="${C.stretch}${TINT}"/>
  <rect x="${H}" y="${H}" width="${H}" height="${H}" fill="${C.balance}${TINT}"/>

  <!-- Symbols -->
  ${heart}
  ${dumbbell}
  ${leaf}
  ${scale}

  <!-- Divider lines -->
  <line x1="${H}" y1="0"    x2="${H}" y2="${SIZE}" stroke="white" stroke-opacity="0.15" stroke-width="2"/>
  <line x1="0"    y1="${H}" x2="${SIZE}" y2="${H}" stroke="white" stroke-opacity="0.15" stroke-width="2"/>
</svg>
`.trim();

const svgBuf = Buffer.from(svg);

async function generate() {
  await sharp(svgBuf).resize(512, 512).png().toFile('public/icon-512.png');
  console.log('✓ public/icon-512.png');
  await sharp(svgBuf).resize(192, 192).png().toFile('public/icon-192.png');
  console.log('✓ public/icon-192.png');
  await sharp(svgBuf).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('✓ public/apple-touch-icon.png');
}

generate().catch(console.error);
