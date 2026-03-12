import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

// Elegant bakery-themed ornamental frame inspired by vintage patisserie labels.
// Features: subtle inner fill, ornate scroll corners, whisk motif top, rolling pin bottom.

const C  = '#C8728A';   // primary stroke
const CL = '#D4899E';   // lighter accent
const BG = '#FFF7FA';   // very subtle inner fill (barely lighter than #FFF0F5)

// viewBox 340 x 300
const FRAME_SVG = `<svg viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">

  <!-- ═══ Subtle inner fill ═══ -->
  <rect x="11" y="11" width="318" height="278" rx="17" ry="17" fill="${BG}" opacity="0.6"/>

  <!-- ═══ Outer border ═══ -->
  <rect x="10" y="10" width="320" height="280" rx="18" ry="18"
        stroke="${C}" stroke-width="1.6" fill="none"/>

  <!-- ═══ Inner border ═══ -->
  <rect x="19" y="19" width="302" height="262" rx="11" ry="11"
        stroke="${C}" stroke-width="0.7" fill="none" opacity="0.45"/>

  <!-- ═══ Corner flourish — top-left ═══ -->
  <g transform="translate(22,22)">
    <!-- main spiral scroll -->
    <path d="M 2 38 C 0 20 4 8 14 3 C 22 0 30 2 34 6"
          stroke="${C}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <!-- inner spiral -->
    <path d="M 6 32 C 4 18 8 10 16 6 C 20 4 26 4 30 8"
          stroke="${C}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.6"/>
    <!-- secondary curl tail going down -->
    <path d="M 14 3 C 8 6 5 14 8 22"
          stroke="${CL}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
    <!-- long decorative tail extending along top edge -->
    <path d="M 34 6 C 44 2 58 0 72 2"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <!-- decorative tail along left edge -->
    <path d="M 2 38 C 0 48 0 60 2 72"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <!-- scroll tip dot -->
    <circle cx="8" cy="22" r="1.8" fill="${C}" opacity="0.45"/>
    <!-- outer tip dot -->
    <circle cx="2" cy="40" r="1.5" fill="${C}" opacity="0.3"/>
  </g>

  <!-- ═══ Corner flourish — top-right ═══ -->
  <g transform="translate(318,22) scale(-1,1)">
    <path d="M 2 38 C 0 20 4 8 14 3 C 22 0 30 2 34 6"
          stroke="${C}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M 6 32 C 4 18 8 10 16 6 C 20 4 26 4 30 8"
          stroke="${C}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M 14 3 C 8 6 5 14 8 22"
          stroke="${CL}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
    <path d="M 34 6 C 44 2 58 0 72 2"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M 2 38 C 0 48 0 60 2 72"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <circle cx="8" cy="22" r="1.8" fill="${C}" opacity="0.45"/>
    <circle cx="2" cy="40" r="1.5" fill="${C}" opacity="0.3"/>
  </g>

  <!-- ═══ Corner flourish — bottom-left ═══ -->
  <g transform="translate(22,278) scale(1,-1)">
    <path d="M 2 38 C 0 20 4 8 14 3 C 22 0 30 2 34 6"
          stroke="${C}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M 6 32 C 4 18 8 10 16 6 C 20 4 26 4 30 8"
          stroke="${C}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M 14 3 C 8 6 5 14 8 22"
          stroke="${CL}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
    <path d="M 34 6 C 44 2 58 0 72 2"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M 2 38 C 0 48 0 60 2 72"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <circle cx="8" cy="22" r="1.8" fill="${C}" opacity="0.45"/>
    <circle cx="2" cy="40" r="1.5" fill="${C}" opacity="0.3"/>
  </g>

  <!-- ═══ Corner flourish — bottom-right ═══ -->
  <g transform="translate(318,278) scale(-1,-1)">
    <path d="M 2 38 C 0 20 4 8 14 3 C 22 0 30 2 34 6"
          stroke="${C}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M 6 32 C 4 18 8 10 16 6 C 20 4 26 4 30 8"
          stroke="${C}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M 14 3 C 8 6 5 14 8 22"
          stroke="${CL}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
    <path d="M 34 6 C 44 2 58 0 72 2"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M 2 38 C 0 48 0 60 2 72"
          stroke="${C}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>
    <circle cx="8" cy="22" r="1.8" fill="${C}" opacity="0.45"/>
    <circle cx="2" cy="40" r="1.5" fill="${C}" opacity="0.3"/>
  </g>

  <!-- ═══ Whisk icon — top center ═══ -->
  <g transform="translate(170,-2)">
    <!-- gap breaker background -->
    <rect x="-16" y="7" width="32" height="8" fill="${BG}"/>
    <!-- handle -->
    <line x1="0" y1="24" x2="0" y2="11" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
    <!-- whisk wires — 7 elegant loops -->
    <path d="M 0 11 C -8 7 -10 -1 -6 -6" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M 0 11 C -5 6 -7 -1 -4 -7" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M 0 11 C -2.5 5 -3 -2 -1.5 -8" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M 0 11 C 0 4 0 -2 0 -8" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M 0 11 C 2.5 5 3 -2 1.5 -8" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M 0 11 C 5 6 7 -1 4 -7" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M 0 11 C 8 7 10 -1 6 -6" stroke="${C}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  </g>

  <!-- ═══ Rolling pin — bottom center ═══ -->
  <g transform="translate(170,290)">
    <!-- gap breaker background -->
    <rect x="-28" y="-9" width="56" height="10" fill="${BG}"/>
    <!-- roller body -->
    <rect x="-16" y="-7" width="32" height="6" rx="3" fill="none" stroke="${C}" stroke-width="1.4"/>
    <!-- left handle -->
    <line x1="-16" y1="-4" x2="-23" y2="-4" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
    <!-- right handle -->
    <line x1="16" y1="-4" x2="23" y2="-4" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
    <!-- handle knobs -->
    <circle cx="-24" cy="-4" r="2.5" fill="${C}" opacity="0.55"/>
    <circle cx="24" cy="-4" r="2.5" fill="${C}" opacity="0.55"/>
  </g>

  <!-- ═══ Side accent dots — left ═══ -->
  <circle cx="14.5" cy="150" r="1.8" fill="${C}" opacity="0.25"/>
  <circle cx="14.5" cy="138" r="1.2" fill="${C}" opacity="0.15"/>
  <circle cx="14.5" cy="162" r="1.2" fill="${C}" opacity="0.15"/>

  <!-- ═══ Side accent dots — right ═══ -->
  <circle cx="325.5" cy="150" r="1.8" fill="${C}" opacity="0.25"/>
  <circle cx="325.5" cy="138" r="1.2" fill="${C}" opacity="0.15"/>
  <circle cx="325.5" cy="162" r="1.2" fill="${C}" opacity="0.15"/>

  <!-- ═══ Top small decorative lines ═══ -->
  <line x1="90" y1="10" x2="130" y2="10" stroke="${CL}" stroke-width="0.8" opacity="0.35"/>
  <line x1="210" y1="10" x2="250" y2="10" stroke="${CL}" stroke-width="0.8" opacity="0.35"/>

  <!-- ═══ Bottom small decorative lines ═══ -->
  <line x1="90" y1="290" x2="130" y2="290" stroke="${CL}" stroke-width="0.8" opacity="0.35"/>
  <line x1="210" y1="290" x2="250" y2="290" stroke="${CL}" stroke-width="0.8" opacity="0.35"/>

</svg>`;

const FRAME_URI = `data:image/svg+xml,${encodeURIComponent(FRAME_SVG)}`;

const ASPECT = 340 / 300;

interface Props {
  children: React.ReactNode;
  width?: number;
}

interface Props {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  contentPaddingVertical?: number;
}

export function BakeryFrame({ children, width = 320, height: heightProp, contentPaddingVertical = 28 }: Props) {
  const height = heightProp ?? width / ASPECT;
  return (
    <View style={[styles.wrapper, { width, height }]}>
      <Image
        source={{ uri: FRAME_URI }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
      />
      <View style={[styles.content, { paddingVertical: contentPaddingVertical }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
