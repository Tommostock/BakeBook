import React from 'react';
import { Image } from 'expo-image';

// Laurel / wheat branch matching the classic wreath style:
//  - Stem arcs in a pronounced crescent (bows FAR outward, tip curls inward)
//  - Solid teardrop leaves alternate on each side of the stem
//  - Leaves are larger in the middle section, smaller at the tips
//
// Left variant: stem bows left (outward), tip curls right (inward toward text).
// Right variant: rendered with scaleX:-1 (mirror).
//
// Teardrop path — tip at (0,0), round end pointing "up".
// rotate(-80) → round end points LEFT  (outer side of left branch)
// rotate( 80) → round end points RIGHT (inner side = toward text)

const C = '#C8728A';

// Elongated teardrops — narrow width (~1:2.5 aspect) to match reference leaf shape
const XL = `M 0 0 C 3 -2 5 -9 3.5 -18 C 2 -24 -2 -24 -3.5 -18 C -5 -9 -3 -2 0 0 Z`;
const LG = `M 0 0 C 2.5 -1.5 4.5 -8 3 -15 C 1.5 -20 -1.5 -20 -3 -15 C -4.5 -8 -2.5 -1.5 0 0 Z`;
const MD = `M 0 0 C 2 -1 3.5 -6 2.5 -11.5 C 1.5 -15.5 -1.5 -15.5 -2.5 -11.5 C -3.5 -6 -2 -1 0 0 Z`;
const SM = `M 0 0 C 1.5 -0.8 3 -5 2 -9 C 1 -12 -1 -12 -2 -9 C -3 -5 -1.5 -0.8 0 0 Z`;
const TY = `M 0 0 C 1.2 -0.5 2 -3.5 1.5 -7 C 0.8 -9.5 -0.8 -9.5 -1.5 -7 C -2 -3.5 -1.2 -0.5 0 0 Z`;

// Helper: one grain element
const g = (d: string, x: number, y: number, r: number) =>
  `<path d="${d}" fill="${C}" transform="translate(${x},${y}) rotate(${r})"/>`;

// The stem: starts bottom-right, sweeps far LEFT (outward), then arcs back
// inward (right) at the top. Significant crescent curvature.
const WHEAT_SVG = `<svg viewBox="0 0 105 215" fill="none" xmlns="http://www.w3.org/2000/svg">

  <!-- Crescent stem: (70,210) → bows left to ~x=20 → tip at (54,5) -->
  <path d="M 70 210 C 38 178 18 115 20 65 C 22 28 40 10 54 4"
        stroke="${C}" stroke-width="2.2" stroke-linecap="round" fill="none"/>

  <!-- ── Grains, alternating outer (rotate -80) / inner (rotate +80) ── -->

  <!-- near base — medium -->
  ${g(MD, 62, 195, -80)}
  ${g(MD, 52, 182, 80)}

  <!-- lower-middle — large -->
  ${g(LG, 43, 168, -80)}
  ${g(LG, 35, 152, 80)}

  <!-- middle — extra-large -->
  ${g(XL, 27, 135, -80)}
  ${g(XL, 22, 118, 80)}

  <!-- upper-middle — large -->
  ${g(LG, 21, 101, -80)}
  ${g(LG, 23, 84, 80)}

  <!-- upper — medium -->
  ${g(MD, 26, 68, -80)}
  ${g(MD, 31, 53, 80)}

  <!-- near tip — small -->
  ${g(SM, 37, 39, -78)}
  ${g(SM, 43, 26, 78)}

  <!-- tip — tiny -->
  ${g(TY, 49, 15, -70)}
  ${g(TY, 54, 6, 60)}
</svg>`;

const WHEAT_URI = `data:image/svg+xml,${encodeURIComponent(WHEAT_SVG)}`;

// Aspect ratio: viewBox 105 × 215
const ASPECT = 105 / 215;

interface Props {
  side: 'left' | 'right';
  height?: number;
}

export function WheatDecoration({ side, height = 175 }: Props) {
  const width = height * ASPECT;
  return (
    <Image
      source={{ uri: WHEAT_URI }}
      style={{
        width,
        height,
        transform: side === 'right' ? [{ scaleX: -1 }] : [],
      }}
      contentFit="contain"
    />
  );
}
