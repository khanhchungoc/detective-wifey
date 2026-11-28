import React from 'react';

/**
 * Aged case-folder paper. Every texture here is a STATIC layer (data-URI SVG grain/masks,
 * gradients, soft inset shadows). Nothing is animated or re-filtered per frame, so drags only
 * move transforms at 120Hz.
 */

const svgUri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

/** Deterministic pseudo-random value in [0, 1) for stable SSR/CSR organic paper edges. */
function paperNoise(seed: number, step: number): number {
  const raw = Math.sin(seed * 127.1 + step * 311.7) * 43758.5453123;
  return raw - Math.floor(raw);
}

/**
 * Paper cellulose grain: static micro-fibers and subtle flecks (zero SVG <filter>/<feTurbulence>
 * so Chrome Android never stalls the raster thread tiling procedural noise during animations).
 */
const SPECK_URI = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="none">` +
    `<g fill="rgba(96,68,30,0.16)">` +
    `<rect x="7" y="11" width="1.4" height="1.2"/><rect x="29" y="5" width="1" height="1"/>` +
    `<rect x="53" y="17" width="1.5" height="1"/><rect x="79" y="9" width="1" height="1.4"/>` +
    `<rect x="14" y="34" width="1" height="1"/><rect x="41" y="28" width="1.4" height="1.2"/>` +
    `<rect x="68" y="39" width="1" height="1"/><rect x="88" y="27" width="1.4" height="1"/>` +
    `<rect x="21" y="58" width="1.4" height="1"/><rect x="48" y="51" width="1" height="1.4"/>` +
    `<rect x="74" y="63" width="1.4" height="1.2"/><rect x="9" y="81" width="1" height="1"/>` +
    `<rect x="35" y="76" width="1.4" height="1"/><rect x="61" y="84" width="1" height="1.4"/>` +
    `<rect x="85" y="79" width="1.4" height="1"/><rect x="58" y="4" width="1" height="1"/>` +
    `<rect x="3" y="48" width="1.4" height="1"/><rect x="91" y="53" width="1" height="1.4"/>` +
    `</g>` +
    `<g stroke="rgba(112,78,32,0.12)" stroke-width="0.65" stroke-linecap="round">` +
    `<path d="M12 18q3-1.5 6 0.4"/><path d="M44 10q2.5 1.4 5.5-0.3"/><path d="M72 22q-2 2.4 1 4.5"/>` +
    `<path d="M22 44q3.5 0.8 6-1.2"/><path d="M62 49q-2.8 1.5-5.2-0.4"/><path d="M82 66q2-2.6 5-1.2"/>` +
    `<path d="M16 74q3-1.2 5.4 1"/><path d="M46 86q3.2-0.9 6.2 0.8"/><path d="M31 62q-1.8 2.8 0.6 4.8"/>` +
    `</g>` +
    `<g stroke="rgba(255,248,232,0.22)" stroke-width="0.6" stroke-linecap="round">` +
    `<path d="M26 24q3-0.8 5.2 0.8"/><path d="M66 14q-2.4 1.6-4.8 0.2"/><path d="M10 60q2.8-1.4 5.4 0.3"/>` +
    `<path d="M54 72q3-1.1 5.6 0.6"/><path d="M78 44q-2.2 2 0.4 4"/>` +
    `</g>` +
    `</svg>`,
);

/** Soft darker corners, as if the sheet yellowed from the rim inward. */
const VIGNETTE = 'radial-gradient(ellipse at 50% 45%, transparent 56%, rgba(112,78,28,0.2) 100%)';

/** Directional cardstock edge aging: warm paper-ply highlight top-left, sepia rim wear all around. */
const EDGE_WEAR = [
  'linear-gradient(to bottom, rgba(255,249,236,0.34) 0px, rgba(118,82,30,0.16) 3px, transparent 15px)',
  'linear-gradient(to right, rgba(255,249,236,0.24) 0px, rgba(118,82,30,0.14) 3px, transparent 13px)',
  'linear-gradient(to left, rgba(84,56,18,0.28) 0px, rgba(118,82,30,0.14) 4px, transparent 15px)',
  'linear-gradient(to top, rgba(78,52,16,0.32) 0px, rgba(118,82,30,0.15) 4px, transparent 17px)',
].join(', ');

/** One faint horizontal fold: a thin shadow line with a highlight right below it. */
const CREASE =
  'linear-gradient(to bottom, transparent calc(50% - 3px), rgba(90,62,22,0.1) calc(50% - 1px), rgba(255,255,255,0.28) calc(50% + 1px), transparent calc(50% + 4px))';

/** Build an organic, slightly deckled cardstock perimeter path inside a W x H viewBox. */
function buildDeckledRectPath(
  w: number,
  h: number,
  inset: number,
  amp: number,
  seed: number,
  sharpTopLeft: boolean,
): string {
  const cTL = sharpTopLeft ? 1 : 5;
  const cTR = 5.5;
  const cBR = 5;
  const cBL = 5.5;
  const pts: Array<[number, number]> = [];
  let step = 1;
  const jitter = (scale = 1) => {
    const n = paperNoise(seed, step++);
    // Occasional tiny cellulose nick mixed with gentle hand-cut waviness.
    const nick = n > 0.88 ? (n - 0.88) * 6.5 : 0;
    return inset + (n * amp + nick) * scale;
  };

  // Top edge (left -> right)
  const topSteps = 22;
  for (let i = 0; i <= topSteps; i += 1) {
    const t = i / topSteps;
    const x = cTL + (w - cTL - cTR) * t;
    const edgeFade = i === 0 || i === topSteps ? 0.5 : 1;
    pts.push([x, jitter(edgeFade)]);
  }
  // Top-right worn corner
  pts.push([w - cTR * 0.35 - inset, cTR * 0.35 + inset]);

  // Right edge (top -> bottom)
  const sideSteps = 30;
  for (let i = 0; i <= sideSteps; i += 1) {
    const t = i / sideSteps;
    const y = cTR + (h - cTR - cBR) * t;
    const edgeFade = i === 0 || i === sideSteps ? 0.5 : 1;
    pts.push([w - jitter(edgeFade), y]);
  }
  // Bottom-right worn corner
  pts.push([w - cBR * 0.35 - inset, h - cBR * 0.35 - inset]);

  // Bottom edge (right -> left)
  for (let i = 0; i <= topSteps; i += 1) {
    const t = i / topSteps;
    const x = w - cBR - (w - cBR - cBL) * t;
    const edgeFade = i === 0 || i === topSteps ? 0.5 : 1;
    pts.push([x, h - jitter(edgeFade)]);
  }
  // Bottom-left worn corner
  pts.push([cBL * 0.35 + inset, h - cBL * 0.35 - inset]);

  // Left edge (bottom -> top)
  for (let i = 0; i <= sideSteps; i += 1) {
    const t = i / sideSteps;
    const y = h - cBL - (h - cBL - cTL) * t;
    const edgeFade = i === 0 || i === sideSteps ? 0.5 : 1;
    pts.push([jitter(edgeFade), y]);
  }
  if (!sharpTopLeft) {
    pts.push([cTL * 0.35 + inset, cTL * 0.35 + inset]);
  }

  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;
}

const PAPER_MASK_CACHE = new Map<string, React.CSSProperties>();

/**
 * Static fibrous deckled-paper alpha mask for rectangular folder bodies, boards, and covers.
 * Uses a solid opaque inner core + a semi-transparent outer cellulose fringe so edges feel
 * tactile and papery rather than digitally razor-cut, with zero per-frame filter cost.
 */
export function paperEdgeMaskStyle(
  variant = 0,
  options?: { sharpTopLeft?: boolean },
): React.CSSProperties {
  const sharpTopLeft = Boolean(options?.sharpTopLeft);
  const key = `${variant % 4}:${sharpTopLeft ? '1' : '0'}`;
  const cached = PAPER_MASK_CACHE.get(key);
  if (cached) return cached;

  const seed = (variant % 4) * 17 + 5;
  const W = 360;
  const H = 520;
  const outerFringe = buildDeckledRectPath(W, H, 0.2, 1.8, seed + 31, sharpTopLeft);
  const innerCore = buildDeckledRectPath(W, H, 1.1, 1.7, seed, sharpTopLeft);

  const maskSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">` +
    `<path d="${outerFringe}" fill="#000" fill-opacity="0.58"/>` +
    `<path d="${innerCore}" fill="#000"/>` +
    `</svg>`;
  const uri = svgUri(maskSvg);

  const style: React.CSSProperties = {
    WebkitMaskImage: uri,
    maskImage: uri,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  };
  PAPER_MASK_CACHE.set(key, style);
  return style;
}

/** Organic deckled clip-path for the top-left index tab on husband case folders. */
export function folderTabClip(variant = 0): string {
  const seed = (variant % 4) * 19 + 11;
  const j = (step: number, max = 1.4) => (paperNoise(seed, step) * max).toFixed(1);
  const pts = [
    `0% 100%`,
    `${j(1, 1.2)}px 68%`,
    `${j(2, 1.1)}px 34%`,
    `calc(4px + ${j(3, 1.0)}px) calc(14% + ${j(4, 0.9)}px)`,
    `calc(10px + ${j(5, 1.0)}px) ${j(6, 1.3)}px`,
    `28% ${j(7, 1.4)}px`,
    `52% ${j(8, 1.3)}px`,
    `74% ${j(9, 1.5)}px`,
    `calc(100% - 10px - ${j(10, 1.0)}px) ${j(11, 1.2)}px`,
    `calc(100% - 4px - ${j(12, 1.0)}px) calc(15% + ${j(13, 0.9)}px)`,
    `calc(100% - ${j(14, 1.1)}px) 36%`,
    `calc(100% - ${j(15, 1.2)}px) 70%`,
    `100% 100%`,
  ];
  return `polygon(${pts.join(', ')})`;
}

/**
 * The ONE paper look used by folder, files, tabs and the briefing sheet: single static layer
 * with cellulose grain + aged edge wear + soft corner burnish. Zero SVG filters.
 */
export const PaperSurface: React.FC<{ worn?: boolean; crease?: boolean; behind?: boolean }> = ({
  worn = true,
  crease = false,
  behind = false,
}) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 rounded-[inherit] ${behind ? '-z-10' : ''}`}
    style={{
      backgroundImage: worn
        ? crease
          ? `${CREASE}, ${EDGE_WEAR}, ${VIGNETTE}, ${SPECK_URI}`
          : `${EDGE_WEAR}, ${VIGNETTE}, ${SPECK_URI}`
        : SPECK_URI,
      backgroundSize: worn
        ? crease
          ? 'auto, auto, auto, auto, auto, auto, 96px 96px'
          : 'auto, auto, auto, auto, auto, 96px 96px'
        : '96px 96px',
    }}
  />
);

/**
 * Typewriter ink. Uses lightweight CSS text-shadow ink bleed instead of live SVG turbulence
 * filters so animated sheets stay 120Hz on Chrome Android GPUs without per-frame shader passes.
 */
export const INK_TEXT = 'font-typewriter font-normal text-game-ink [text-shadow:0_0_0.5px_rgba(42,30,12,0.28)]';
/** Slightly stronger bleed for headings; emphasis comes from the ink, not a bold weight. */
export const INK_TEXT_STRONG = 'font-typewriter font-normal text-game-ink [text-shadow:0_0_0.75px_rgba(42,30,12,0.42)]';
/** Secondary typed text (labels). Still AA on paper. */
export const INK_TEXT_SOFT = 'font-typewriter font-normal text-game-ink-secondary [text-shadow:0_0_0.5px_rgba(42,30,12,0.22)]';

/** Kept as a no-op export for screen callers; ink styling is pure CSS now. */
export const InkFilterDefs: React.FC = () => null;

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
    className={`inline-block rounded-sm border-2 px-2 py-0.5 font-dossier text-ios-caption-2 font-extrabold uppercase opacity-85 ${
      tone === 'red' ? 'border-game-crimson-deep text-game-crimson-deep' : 'border-game-ink text-game-ink'
    } ${className ?? ''}`}
  >
    {children}
  </span>
);

/** Typed label strip glued on the folder. */
export const LabelStrip: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div
    className={`relative rounded-[2px] border border-game-ink/20 bg-game-label-strip px-3 py-1.5 shadow-sm ${className ?? ''}`}
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: SPECK_URI, backgroundSize: '96px 96px', opacity: 0.7 }}
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
    className={`block h-3.5 rounded-[1px] bg-black ${className ?? ''}`}
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
    className={`relative ${tilt} rounded-[2px] bg-game-film-frame p-1.5 shadow-md ${className ?? ''}`}
  >
    <div className="relative aspect-[3/4] h-full overflow-hidden bg-game-backdrop">
      {src ? (
        <img
          src={src}
          alt=""
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <RedactedSilhouette className="absolute inset-0 h-full w-full" />
      )}
    </div>
    <Paperclip className="absolute -top-5 right-3 z-10 h-11 w-5" />
  </figure>
);
