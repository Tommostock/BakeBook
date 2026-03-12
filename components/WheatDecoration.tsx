import React from 'react';
import { Image } from 'expo-image';

// Left wheat stalk — teardrop grains alternate left/right, larger at base, stem
// gently bows outward (left) then arcs inward (right) at the top. The right variant
// is produced by applying scaleX: -1 so it mirrors correctly.
//
// Teardrop grain path (tip at origin, round end pointing "up"):
//   Large  ~ 23px tall × 13px wide
//   Medium ~ 19px tall × 10px wide
//   Small  ~ 14px tall × 8px wide
//   Tiny   ~ 10px tall × 6px wide
//
// Each grain is placed with transform="translate(stemX, stemY) rotate(±70)"
// rotate(-70): round end points upper-left  (away from text, outward)
// rotate(+70): round end points upper-right (toward text, inward)

const L = `M 0 0 C 5 -2 8.5 -9 6 -17 C 4 -23 -4 -23 -6 -17 C -8.5 -9 -5 -2 0 0 Z`;
const M = `M 0 0 C 4 -1.5 7 -7.5 5 -14 C 3 -19 -3 -19 -5 -14 C -7 -7.5 -4 -1.5 0 0 Z`;
const S = `M 0 0 C 3 -1.5 5.5 -6 4 -11 C 2.5 -15 -2.5 -15 -4 -11 C -5.5 -6 -3 -1.5 0 0 Z`;
const T = `M 0 0 C 2.5 -1 4 -4.5 3 -8.5 C 2 -11.5 -2 -11.5 -3 -8.5 C -4 -4.5 -2.5 -1 0 0 Z`;

const C = '#C8728A'; // dark-pink fill colour

// Grain helper — returns an SVG path element string
const g = (d: string, x: number, y: number, r: number) =>
  `<path d="${d}" fill="${C}" transform="translate(${x},${y}) rotate(${r})"/>`;

const WHEAT_SVG = `<svg viewBox="0 0 70 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Stem: starts bottom-centre, bows left (outward) in middle, arcs right (inward) at top -->
  <path d="M 36 196 C 30 165 22 118 24 78 C 26 45 34 22 40 6"
        stroke="${C}" stroke-width="2.2" stroke-linecap="round" fill="none"/>

  <!-- PAIR 1 — large, near base -->
  ${g(L, 36, 181, -70)}
  ${g(L, 34, 174, 70)}

  <!-- PAIR 2 — large -->
  ${g(L, 31, 157, -70)}
  ${g(L, 29, 151, 70)}

  <!-- PAIR 3 — medium-large -->
  ${g(M, 27, 136, -70)}
  ${g(M, 26, 129, 70)}

  <!-- PAIR 4 — medium -->
  ${g(M, 25, 115, -70)}
  ${g(M, 25, 108, 70)}

  <!-- PAIR 5 — small -->
  ${g(S, 26, 94, -70)}
  ${g(S, 26, 88, 70)}

  <!-- PAIR 6 — small -->
  ${g(S, 28, 73, -70)}
  ${g(S, 29, 67, 70)}

  <!-- PAIR 7 — tiny -->
  ${g(T, 31, 53, -70)}
  ${g(T, 32, 47, 70)}

  <!-- TOP HEAD — tiny grains fanning outward toward top -->
  ${g(T, 35, 36, -55)}
  ${g(T, 38, 27, -20)}
  ${g(T, 40, 18, 15)}
</svg>`;

const WHEAT_URI = `data:image/svg+xml,${encodeURIComponent(WHEAT_SVG)}`;

// Aspect ratio: viewBox 70 × 200
const ASPECT = 70 / 200;

interface Props {
  side: 'left' | 'right';
  height?: number;
}

export function WheatDecoration({ side, height = 165 }: Props) {
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
