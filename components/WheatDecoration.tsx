import React from 'react';
import { Image } from 'expo-image';

// Wheat stalk SVG — left variant (stem runs straight up, head curls right/inward at top).
// Right variant is rendered with scaleX: -1 so the head curls left/inward.
const WHEAT_SVG = `<svg viewBox="0 0 55 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Main stem: straight up then arcs right (inward) near the top -->
  <path d="M 27 186 C 27 148 27 100 27 62 C 27 36 32 16 40 7"
        stroke="#C8728A" stroke-width="2" stroke-linecap="round" fill="none"/>

  <!-- Wheat head — 3 husks fanning inward/right -->
  <ellipse cx="37" cy="21" rx="4"   ry="9.5" fill="#C8728A" transform="rotate(-32 37 21)"/>
  <ellipse cx="44" cy="13" rx="3.5" ry="8.5" fill="#C8728A" transform="rotate(-20 44 13)"/>
  <ellipse cx="46" cy="30" rx="3.5" ry="8"   fill="#C8728A" transform="rotate( 7 46 30)"/>

  <!-- Grain pairs along stem — left grains lean upper-left, right grains lean upper-right -->
  <ellipse cx="14" cy="60"  rx="3"   ry="7.5" fill="#C8728A" transform="rotate(-44 14 60)"/>
  <ellipse cx="38" cy="55"  rx="3"   ry="7.5" fill="#C8728A" transform="rotate( 32 38 55)"/>

  <ellipse cx="14" cy="84"  rx="3"   ry="7"   fill="#C8728A" transform="rotate(-44 14 84)"/>
  <ellipse cx="38" cy="79"  rx="3"   ry="7"   fill="#C8728A" transform="rotate( 32 38 79)"/>

  <ellipse cx="14" cy="108" rx="3"   ry="6.5" fill="#C8728A" transform="rotate(-44 14 108)"/>
  <ellipse cx="38" cy="103" rx="3"   ry="6.5" fill="#C8728A" transform="rotate( 32 38 103)"/>

  <ellipse cx="15" cy="130" rx="2.8" ry="6"   fill="#C8728A" transform="rotate(-44 15 130)"/>
  <ellipse cx="38" cy="126" rx="2.8" ry="6"   fill="#C8728A" transform="rotate( 32 38 126)"/>

  <ellipse cx="16" cy="152" rx="2.5" ry="5.5" fill="#C8728A" transform="rotate(-44 16 152)"/>
  <ellipse cx="38" cy="148" rx="2.5" ry="5.5" fill="#C8728A" transform="rotate( 32 38 148)"/>

  <ellipse cx="17" cy="172" rx="2.5" ry="5"   fill="#C8728A" transform="rotate(-44 17 172)"/>
  <ellipse cx="37" cy="169" rx="2.5" ry="5"   fill="#C8728A" transform="rotate( 32 37 169)"/>
</svg>`;

const WHEAT_URI = `data:image/svg+xml,${encodeURIComponent(WHEAT_SVG)}`;

// Aspect ratio: viewBox 55 × 190
const ASPECT = 55 / 190;

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
