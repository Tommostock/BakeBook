import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';

// Light transparent collage of baking utensils, foods, and icons.
// Rendered as an absolute-fill background layer behind the hero content.

const C = '#D4899E'; // soft pink for silhouettes

// ── Individual baking icon path helpers ──
// Each returns an SVG <g> element positioned at (x,y) with rotation r and scale s.

const icon = (paths: string, x: number, y: number, r: number, s: number, opacity: number) =>
  `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})" opacity="${opacity}">${paths}</g>`;

// Whisk
const WHISK = `
  <line x1="0" y1="0" x2="0" y2="18" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <path d="M 0 0 C -5 -4 -6 -10 -3 -14" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M 0 0 C -2 -5 -2 -11 0 -15" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M 0 0 C 2 -5 2 -11 0 -15" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M 0 0 C 5 -4 6 -10 3 -14" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
`;

// Rolling pin
const ROLLING_PIN = `
  <rect x="-12" y="-3" width="24" height="6" rx="3" stroke="${C}" stroke-width="1.3" fill="none"/>
  <line x1="-12" y1="0" x2="-18" y2="0" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <line x1="12" y1="0" x2="18" y2="0" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="-19" cy="0" r="2" fill="${C}" opacity="0.5"/>
  <circle cx="19" cy="0" r="2" fill="${C}" opacity="0.5"/>
`;

// Cupcake
const CUPCAKE = `
  <path d="M -8 4 L -6 14 L 6 14 L 8 4 Z" stroke="${C}" stroke-width="1.3" fill="none"/>
  <path d="M -9 4 C -9 -2 -5 -6 0 -6 C 5 -6 9 -2 9 4" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <path d="M -6 -3 C -4 -8 4 -8 6 -3" stroke="${C}" stroke-width="1" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-9" r="1.5" fill="${C}" opacity="0.5"/>
`;

// Croissant
const CROISSANT = `
  <path d="M -12 2 C -8 -6 -3 -8 0 -6 C 3 -8 8 -6 12 2 C 8 0 3 2 0 0 C -3 2 -8 0 -12 2 Z"
        stroke="${C}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
  <path d="M -6 -2 C -4 -4 4 -4 6 -2" stroke="${C}" stroke-width="0.8" fill="none"/>
`;

// Mixing bowl
const BOWL = `
  <path d="M -12 0 C -12 10 -6 16 0 16 C 6 16 12 10 12 0" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <line x1="-14" y1="0" x2="14" y2="0" stroke="${C}" stroke-width="1.3" stroke-linecap="round"/>
`;

// Spatula
const SPATULA = `
  <line x1="0" y1="0" x2="0" y2="20" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <rect x="-5" y="-10" width="10" height="11" rx="2" stroke="${C}" stroke-width="1.3" fill="none"/>
`;

// Cookie (circle with chips)
const COOKIE = `
  <circle cx="0" cy="0" r="10" stroke="${C}" stroke-width="1.3" fill="none"/>
  <circle cx="-3" cy="-3" r="1.5" fill="${C}" opacity="0.4"/>
  <circle cx="4" cy="1" r="1.5" fill="${C}" opacity="0.4"/>
  <circle cx="-1" cy="5" r="1.5" fill="${C}" opacity="0.4"/>
  <circle cx="3" cy="-5" r="1" fill="${C}" opacity="0.3"/>
`;

// Cake slice
const CAKE_SLICE = `
  <path d="M 0 -10 L -10 8 L 10 8 Z" stroke="${C}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
  <line x1="-6" y1="1" x2="6" y2="1" stroke="${C}" stroke-width="0.8"/>
  <circle cx="0" cy="-5" r="1.2" fill="${C}" opacity="0.4"/>
`;

// Bread loaf
const BREAD = `
  <path d="M -10 6 L -10 0 C -10 -6 -4 -10 0 -10 C 4 -10 10 -6 10 0 L 10 6 Z"
        stroke="${C}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
  <path d="M -4 -8 C -2 -5 2 -5 4 -8" stroke="${C}" stroke-width="0.8" fill="none"/>
`;

// Chef hat
const CHEF_HAT = `
  <path d="M -8 6 L -8 0 C -8 -4 -10 -8 -6 -10 C -2 -12 0 -8 0 -8 C 0 -8 2 -12 6 -10 C 10 -8 8 -4 8 0 L 8 6"
        stroke="${C}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
  <line x1="-9" y1="6" x2="9" y2="6" stroke="${C}" stroke-width="1.3" stroke-linecap="round"/>
`;

// Oven mitt
const MITT = `
  <path d="M -4 12 L -4 0 C -4 -4 -8 -6 -8 -10 C -8 -14 -4 -14 -2 -10 L 0 -4 L 0 -8 C 0 -12 4 -12 4 -8 L 4 0 L 4 12 Z"
        stroke="${C}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
`;

// Star / sprinkle
const STAR = `
  <path d="M 0 -6 L 1.5 -2 L 6 -2 L 2.5 1 L 4 5 L 0 2.5 L -4 5 L -2.5 1 L -6 -2 L -1.5 -2 Z"
        stroke="${C}" stroke-width="1" fill="${C}" opacity="0.3"/>
`;

// Measuring cup
const MEASURE_CUP = `
  <path d="M -6 -8 L -8 8 L 8 8 L 6 -8 Z" stroke="${C}" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
  <line x1="-7" y1="0" x2="7" y2="0" stroke="${C}" stroke-width="0.7" opacity="0.5"/>
  <line x1="-7.5" y1="4" x2="7.5" y2="4" stroke="${C}" stroke-width="0.7" opacity="0.5"/>
  <path d="M 6 -4 C 10 -4 10 2 6 2" stroke="${C}" stroke-width="1.2" fill="none"/>
`;

// All icon types for cycling
const ICONS = [WHISK, ROLLING_PIN, CUPCAKE, CROISSANT, BOWL, SPATULA, COOKIE, CAKE_SLICE, BREAD, CHEF_HAT, MITT, MEASURE_CUP];

// Very dense collage — 20 cols x 14 rows, tight spacing, central exclusion zone
// viewBox 700 x 340

// Grid: cols spaced ~35px, rows spaced ~24px, odd rows offset +17px
const cols: number[] = [];
for (let i = 0; i < 20; i++) cols.push(18 + i * 35);
const rows: number[] = [];
for (let i = 0; i < 14; i++) rows.push(12 + i * 24);
const offX = [0, 17]; // stagger odd rows

// Central exclusion zone — where the BakeryFrame sits
const EX_L = 210;
const EX_R = 490;
const EX_T = 10;
const EX_B = 330;

// Deterministic varied rotations, opacities, scales
const rots = [15, -22, 8, -30, 20, -12, 35, -5, 25, -18, 10, -28, 5, -15, 32, -8, 18, -25, 12, -35];
const opas = [0.11, 0.14, 0.10, 0.13, 0.15, 0.11, 0.12, 0.10, 0.14, 0.11, 0.13, 0.15, 0.10, 0.12, 0.11, 0.14, 0.13, 0.10, 0.12, 0.15];
const scls = [0.45, 0.52, 0.48, 0.50, 0.55, 0.47, 0.51, 0.45, 0.49, 0.53, 0.47, 0.52, 0.49, 0.45, 0.55, 0.48, 0.51, 0.49, 0.53, 0.46];

let icons = '';
let idx = 0;
for (let ri = 0; ri < rows.length; ri++) {
  for (let ci = 0; ci < cols.length; ci++) {
    const x = cols[ci] + offX[ri % 2];
    const y = rows[ri];
    // Skip icons inside the frame exclusion zone
    if (x > EX_L && x < EX_R && y > EX_T && y < EX_B) {
      idx++;
      continue;
    }
    const ic = ICONS[idx % ICONS.length];
    const r = rots[idx % rots.length];
    const o = opas[idx % opas.length];
    const s = scls[idx % scls.length];
    icons += icon(ic, x, y, r, s, o);
    idx++;
  }
}

const COLLAGE_SVG = `<svg viewBox="0 0 700 340" fill="none" xmlns="http://www.w3.org/2000/svg">${icons}</svg>`;

const COLLAGE_URI = `data:image/svg+xml,${encodeURIComponent(COLLAGE_SVG)}`;

export function BakeryCollage() {
  return (
    <Image
      source={{ uri: COLLAGE_URI }}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
    />
  );
}
