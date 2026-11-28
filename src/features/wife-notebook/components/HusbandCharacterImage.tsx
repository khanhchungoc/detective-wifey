import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ConfrontationMood } from '../../../shared/contracts/case-schema';
import { NARRATIVE_IN, NARRATIVE_OUT, POP, REDUCED_FADE } from '../confrontationMotion';
import hoangConfidentSvg from '../assets/hoang-comic-confident.svg';
import hoangSmugSvg from '../assets/hoang-comic-smug.svg';
import hoangNervousSvg from '../assets/hoang-comic-nervous.svg';
import hoangBrokenSvg from '../assets/hoang-comic-broken.svg';

export type HusbandMood = ConfrontationMood | 'surprised';

export const HOANG_COMIC_ASSETS: Record<ConfrontationMood, string> = {
  confident: hoangConfidentSvg,
  smug: hoangSmugSvg,
  nervous: hoangNervousSvg,
  broken: hoangBrokenSvg,
};

export interface HusbandCharacterImageProps {
  mood: HusbandMood;
  size?: number;
  hitTrigger?: number;
  className?: string;
}

const MOOD_DESCRIPTIONS: Record<HusbandMood, string> = {
  confident: 'Thịnh khoanh tay điềm tĩnh tự tin chối tội dưới ánh đèn thẩm vấn',
  smug: 'Thịnh nhếch mép cười cợt kệch cỡm khi thiếu chứng cứ',
  surprised: 'Thịnh giật mình phân bua dưới ánh đèn thẩm vấn',
  nervous: 'Thịnh toát mồ hôi lúng túng kéo cổ áo bao biện',
  broken: 'Thịnh cúi đầu bật khóc chắp tay suy sụp xin tha',
};

const SPOTLIGHT_ACCENT: Record<HusbandMood, { beam: string; rim: string }> = {
  confident: { beam: 'rgba(186, 230, 253, 0.22)', rim: '#38bdf8' },
  smug: { beam: 'rgba(254, 240, 138, 0.22)', rim: '#facc15' },
  surprised: { beam: 'rgba(253, 224, 71, 0.22)', rim: '#facc15' },
  nervous: { beam: 'rgba(253, 186, 116, 0.25)', rim: '#fb923c' },
  broken: { beam: 'rgba(253, 164, 175, 0.26)', rim: '#f43f5e' },
};

function resolveComicMood(mood: HusbandMood): ConfrontationMood {
  if (mood === 'surprised') return 'nervous';
  return mood;
}

/**
 * Noir Comic Portrait of Husband Thịnh in a dark interrogation room with overhead spotlight.
 * Animates exclusively compositor-safe `transform` and `opacity`, honoring `useReducedMotion()`.
 */
export const HusbandCharacterImage: React.FC<HusbandCharacterImageProps> = ({
  mood,
  size = 180,
  hitTrigger = 0,
  className = '',
}) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const comicMood = resolveComicMood(mood);
  const portraitSrc = HOANG_COMIC_ASSETS[comicMood];
  const accent = SPOTLIGHT_ACCENT[mood];

  return (
    <div
      role="img"
      aria-label={MOOD_DESCRIPTIONS[mood]}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Interrogation Room Dark Concrete Stage & Overhead Lamp SVG */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="bg-confident" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#131c2b" />
            <stop offset="100%" stopColor="#080b0f" />
          </linearGradient>
          <linearGradient id="bg-smug" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#1f1b12" />
            <stop offset="100%" stopColor="#080b0f" />
          </linearGradient>
          <linearGradient id="bg-surprised" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#261c10" />
            <stop offset="100%" stopColor="#080b0f" />
          </linearGradient>
          <linearGradient id="bg-nervous" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#27160f" />
            <stop offset="100%" stopColor="#080b0f" />
          </linearGradient>
          <linearGradient id="bg-broken" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#261019" />
            <stop offset="100%" stopColor="#080b0f" />
          </linearGradient>
          <linearGradient id={`cone-${mood}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.34" />
            <stop offset="45%" stopColor={accent.rim} stopOpacity="0.14" />
            <stop offset="100%" stopColor="#080b0f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Dark Interrogation Wall */}
        <rect x="0" y="0" width="200" height="200" rx="16" fill={`url(#bg-${mood})`} />
        <line x1="0" y1="54" x2="200" y2="54" stroke="#1e293b" strokeWidth="0.75" opacity="0.32" />
        <line x1="0" y1="108" x2="200" y2="108" stroke="#1e293b" strokeWidth="0.75" opacity="0.28" />
        <line x1="0" y1="160" x2="200" y2="160" stroke="#1e293b" strokeWidth="0.75" opacity="0.24" />

        {/* Static Base Spotlight Cone */}
        <polygon points="82,6 118,6 186,200 14,200" fill={`url(#cone-${mood})`} />

        {/* Industrial Overhead Spotlight Fixture */}
        <line x1="100" y1="0" x2="100" y2="5" stroke="#475569" strokeWidth="2" />
        <path d="M 80 8 L 88 3 L 112 3 L 120 8 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
        <ellipse cx="100" cy="8.5" rx="17" ry="2.2" fill="#f8fafc" opacity="0.92" />
      </svg>

      {/* Compositor-Only Volumetric Top-Down Spotlight Pulse */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-top will-change-[transform,opacity]"
        style={{
          background: `radial-gradient(ellipse 68% 88% at 50% 4%, ${accent.beam} 0%, transparent 74%)`,
        }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.85, scaleX: 1 }
            : { opacity: [0.74, 0.96, 0.8], scaleX: [0.98, 1.03, 0.99] }
        }
        transition={
          prefersReducedMotion
            ? REDUCED_FADE
            : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      {/* Critical Evidence Hit Recoil Layer (POP spring) */}
      <motion.div
        key={hitTrigger}
        className="relative z-10 h-full w-full flex items-end justify-center will-change-transform"
        initial={
          !prefersReducedMotion && hitTrigger > 0
            ? { x: -10, y: 5, scale: 0.94 }
            : false
        }
        animate={{ x: 0, y: 0, scale: 1 }}
        transition={prefersReducedMotion ? REDUCED_FADE : POP}
      >
        {/* Idle Breathing / Broken Tremble Layer */}
        <motion.div
          className="relative h-full w-full will-change-transform"
          animate={
            prefersReducedMotion
              ? { x: 0, y: 0, scale: 1 }
              : comicMood === 'broken'
                ? {
                    x: [0, -1.2, 1.2, -0.8, 0.8, 0],
                    y: [0, 1, 0.4, 1.2, 0],
                    scale: 1,
                  }
                : {
                    x: 0,
                    y: [0, -2, 0],
                    scale: [1, 1.012, 1],
                  }
          }
          transition={
            prefersReducedMotion
              ? REDUCED_FADE
              : comicMood === 'broken'
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.img
              key={comicMood}
              src={portraitSrc}
              alt=""
              draggable={false}
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-contain will-change-[transform,opacity]"
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.985 }}
              animate={{ opacity: 1, scale: 1, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN }}
              exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
            />
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Subtle Noir Edge Vignette + Rim Hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl border border-white/10 shadow-[inset_0_0_24px_rgba(8,11,15,0.88)]"
      />
    </div>
  );
};
