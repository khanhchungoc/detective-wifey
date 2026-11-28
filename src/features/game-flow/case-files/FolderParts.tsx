import React from 'react';

/**
 * Aged case-folder paper. Every texture here is a STATIC layer (data-URI SVG noise, gradients,
 * inset shadows). Nothing is animated or re-filtered per frame, so drags only move transforms.
 */

const svgUri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/**
 * Paper speckle: isotropic fine fibre noise (same frequency on both axes, so no streaks), dark brown,
 * very low alpha. A 256px tile with stitching so repeats are invisible at this contrast.
 */
const SPECK_URI = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="s" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="21" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.36  0 0 0 0 0.27  0 0 0 0 0.14  0 0 0 -3 1.3"/></filter><rect width="256" height="256" filter="url(#s)"/></svg>`,
);

/** Rough ink: erodes a stamp with speckles. Used as a mask on a static element. */
const INK_MASK_URI = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.75"/></filter><rect width="160" height="160" filter="url(#m)"/></svg>`,
);

/** A few faint foxing spots (age freckles), fixed positions so the sheet looks the same on every render. */
const FOXING =
  'radial-gradient(circle at 18% 24%, rgba(150,100,40,0.13) 0, transparent 9px), radial-gradient(circle at 71% 12%, rgba(150,100,40,0.10) 0, transparent 14px), radial-gradient(circle at 84% 63%, rgba(150,100,40,0.12) 0, transparent 11px), radial-gradient(circle at 33% 82%, rgba(150,100,40,0.09) 0, transparent 16px), radial-gradient(circle at 9% 57%, rgba(150,100,40,0.08) 0, transparent 7px)';

/** Soft darker edges, as if the sheet yellowed from the rim inward. */
const VIGNETTE = 'radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(112,80,30,0.2) 100%)';

/** One faint horizontal fold: a thin shadow line with a highlight right below it. */
const CREASE =
  'linear-gradient(to bottom, transparent calc(50% - 3px), rgba(90,62,22,0.1) calc(50% - 1px), rgba(255,255,255,0.28) calc(50% + 1px), transparent calc(50% + 4px))';

/**
 * The ONE paper look used by folder, files, tabs and the briefing sheet: flat paper colour (set by the
 * parent's bg token) + fine isotropic speckle + faint foxing + darker rim. Static layers only.
 * Parent must be `relative`; pass `behind` (with `isolate` on the parent) when the content is not itself positioned.
 */
export const PaperSurface: React.FC<{ worn?: boolean; crease?: boolean; behind?: boolean }> = ({
  worn = true,
  crease = false,
  behind = false,
}) => (
  <>
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${behind ? '-z-10' : ''}`}
      style={{
        backgroundImage: `${worn ? `${FOXING}, ` : ''}${SPECK_URI}`,
        backgroundSize: worn ? 'auto, auto, auto, auto, auto, 256px 256px' : '256px 256px',
        opacity: 0.42,
      }}
    />
    {worn && (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-[inherit] ${behind ? '-z-10' : ''}`}
        style={{
          backgroundImage: crease ? `${CREASE}, ${VIGNETTE}` : VIGNETTE,
          boxShadow: 'inset 0 0 10px rgba(122,86,28,0.22)',
        }}
      />
    )}
  </>
);

/**
 * Typewriter ink. `INK_FILTER_ID` is defined once per screen by <InkFilterDefs />; the filter is static
 * (no animation), so it is rasterised once and never re-run during drags.
 */
export const INK_TEXT = 'font-typewriter font-normal text-game-ink [filter:url(#ink-spread)]';
/** Slightly stronger bleed for headings. Xanh Mono has a single weight, so emphasis comes from here. */
export const INK_TEXT_STRONG = 'font-typewriter font-normal text-game-ink [filter:url(#ink-press)]';
/** Secondary typed text (labels). Still AA on paper. */
export const INK_TEXT_SOFT = 'font-typewriter font-normal text-game-ink-secondary [filter:url(#ink-spread)]';

const inkFilter = (id: string, blur: number, displace: number, table: string) => (
  <filter id={id} x="-2%" y="-8%" width="104%" height="116%" colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" result="grain" />
    <feDisplacementMap in="SourceGraphic" in2="grain" scale={displace} xChannelSelector="R" yChannelSelector="G" result="wobble" />
    <feGaussianBlur in="wobble" stdDeviation={blur} result="bleed" />
    <feComponentTransfer in="bleed" result="inked">
      <feFuncA type="table" tableValues={table} />
    </feComponentTransfer>
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="cloud" />
    <feColorMatrix in="cloud" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.4" result="density" />
    <feComposite in="inked" in2="density" operator="in" />
  </filter>
);

/** Render once per screen that shows typed paper text. */
export const InkFilterDefs: React.FC = () => (
  <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
    <defs>
      {inkFilter('ink-spread', 0.35, 1.0, '0 0.2 0.8 1 1 1')}
      {inkFilter('ink-press', 0.5, 1.2, '0 0.3 0.9 1 1 1')}
    </defs>
  </svg>
);

/** Coffee ring stain, drawn once as a static SVG. */
export const CoffeeRing: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 100 100" className={`pointer-events-none ${className ?? ''}`} fill="none">
    <circle cx="50" cy="50" r="38" fill="rgba(120,72,24,0.07)" />
    <circle cx="50" cy="50" r="38" stroke="rgba(110,64,20,0.34)" strokeWidth="3.2" strokeDasharray="190 50" strokeLinecap="round" />
    <circle cx="51" cy="49" r="36" stroke="rgba(110,64,20,0.16)" strokeWidth="1.4" />
    <circle cx="79" cy="30" r="2.6" fill="rgba(110,64,20,0.3)" />
  </svg>
);

/** Metal staple holding the corner of the sheet. */
export const Staple: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 40 14" className={`pointer-events-none ${className ?? ''}`} fill="none">
    <path d="M3 8h34" stroke="rgba(60,40,10,0.35)" strokeWidth="3.6" strokeLinecap="round" />
    <path d="M3 6.5h34" stroke="#8B93A0" strokeWidth="3" strokeLinecap="round" />
    <path d="M4 5.6h32" stroke="#D5DAE2" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/** Paper-clip drawn inline so it ships with the folder. */
export const Paperclip: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 24 56" fill="none" className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 40V14a5 5 0 0 1 10 0v30a8 8 0 0 1-16 0V18" stroke="rgba(40,30,10,0.35)" strokeWidth="3" transform="translate(1.2 1.6)" />
    <path d="M8 40V14a5 5 0 0 1 10 0v30a8 8 0 0 1-16 0V18" stroke="#7B8494" strokeWidth="2.4" />
    <path d="M8 40V14a5 5 0 0 1 10 0" stroke="#D5DAE2" strokeWidth="0.8" />
  </svg>
);

/** Rubber stamp with rough, uneven ink. The mask is a static speckle layer. */
export const RubberStamp: React.FC<{
  children: React.ReactNode;
  tone: 'red' | 'slate';
  className?: string;
  dataAttrs?: Record<string, string | undefined>;
}> = ({ children, tone, className, dataAttrs }) => (
  <span
    {...dataAttrs}
    style={{
      WebkitMaskImage: INK_MASK_URI,
      maskImage: INK_MASK_URI,
      WebkitMaskSize: '160px 160px',
      maskSize: '160px 160px',
    }}
    className={`inline-block rounded-sm border-2 px-2 py-0.5 font-dossier text-ios-caption-2 font-extrabold uppercase ${
      tone === 'red' ? 'border-game-crimson-deep text-game-crimson-deep' : 'border-game-ink text-game-ink'
    } ${className ?? ''}`}
  >
    {children}
  </span>
);

/** Typed label strip glued on the folder. */
export const LabelStrip: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div
    className={`relative rounded-[2px] border border-game-ink/20 bg-game-label-strip px-3 py-1.5 shadow-[0_2px_3px_-1px_rgba(60,40,10,0.45)] ${className ?? ''}`}
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: SPECK_URI, backgroundSize: '256px 256px', opacity: 0.8 }}
    />
    <div className="relative">{children}</div>
  </div>
);

/** Redacted silhouette for dossiers that are not released yet. Never uses a real portrait. */
export const RedactedSilhouette: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" className={className}>
    <defs>
      <pattern id="redacted-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="#141A22" />
        <rect width="3" height="8" fill="#1B2330" />
      </pattern>
    </defs>
    <rect width="120" height="160" fill="url(#redacted-hatch)" />
    <circle cx="60" cy="62" r="26" fill="#080B0F" />
    <path d="M10 160c0-34 22-56 50-56s50 22 50 56z" fill="#080B0F" />
    <rect x="26" y="54" width="68" height="14" fill="#000000" />
  </svg>
);

export const RedactionBar: React.FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden="true"
    className={`block h-3.5 rounded-[1px] bg-black [filter:url(#ink-press)] ${className ?? ''}`}
  />
);

/**
 * Photo of the subject: 3:4, head and shoulders, white print border, slight tilt, paper-clipped.
 * `src` null renders the redacted placeholder instead.
 */
export const AttachedPhoto: React.FC<{
  src: string | null;
  className?: string;
  tilt?: string;
}> = ({ src, className, tilt = '-rotate-2' }) => (
  <figure
    className={`relative ${tilt} rounded-[2px] bg-game-film-frame p-1.5 shadow-[0_6px_12px_-4px_rgba(60,40,10,0.6),0_1px_2px_rgba(60,40,10,0.4)] ${className ?? ''}`}
  >
    <div className="relative aspect-[3/4] h-full overflow-hidden bg-game-backdrop">
      {src ? (
        <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover object-center" />
      ) : (
        <RedactedSilhouette className="absolute inset-0 h-full w-full" />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.25)' }}
      />
    </div>
    <Paperclip className="absolute -top-5 right-3 z-10 h-11 w-5" />
  </figure>
);
