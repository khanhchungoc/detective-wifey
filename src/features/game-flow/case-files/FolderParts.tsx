import React from 'react';

/** Paper-clip drawn inline so it ships with the folder. */
export const Paperclip: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 56"
    fill="none"
    className={className}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M8 40V14a5 5 0 0 1 10 0v30a8 8 0 0 1-16 0V18"
      stroke="currentColor"
      strokeWidth="2.4"
    />
  </svg>
);

/** Redacted silhouette for dossiers that are not released yet. Never uses a real portrait. */
export const RedactedSilhouette: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 120 140"
    preserveAspectRatio="xMidYMid slice"
    className={className}
  >
    <defs>
      <pattern id="redacted-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="#141A22" />
        <rect width="3" height="8" fill="#1B2330" />
      </pattern>
    </defs>
    <rect width="120" height="140" fill="url(#redacted-hatch)" />
    <circle cx="60" cy="52" r="24" fill="#080B0F" />
    <path d="M14 140c0-30 20-50 46-50s46 20 46 50z" fill="#080B0F" />
    <rect x="30" y="44" width="60" height="12" fill="#000000" />
    <rect x="30" y="44" width="60" height="12" fill="none" stroke="#64748B" strokeWidth="0.6" strokeDasharray="3 2" />
  </svg>
);

export const RedactionBar: React.FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden="true"
    className={`block h-3.5 rounded-sm bg-black ${className ?? ''}`}
  />
);

/** Manila paper texture: tan wash plus a faint fiber gradient. Pure CSS, token colors only. */
export const ManilaWash: React.FC = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-game-tape/45 via-game-tape/20 to-game-tape/40"
  />
);

/** Faint ruled-paper lines (ink-secondary at low alpha) so empty paper reads as a form, not a void. */
export const RuledLines: React.FC = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-4 top-1/2 bottom-24 opacity-70"
    style={{
      backgroundImage:
        'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(71,85,105,0.22) 27px, rgba(71,85,105,0.22) 28px)',
    }}
  />
);

/** Taped polaroid of the subject, clipped to the case file. */
export const SubjectPolaroid: React.FC<{ src: string }> = ({ src }) => (
  <figure className="relative ml-auto mr-1 w-28 rotate-3 rounded-sm bg-game-film-frame p-1.5 pb-5 shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]">
    <span
      aria-hidden="true"
      className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-3 bg-game-tape/70"
    />
    <img src={src} alt="" draggable={false} className="aspect-square w-full object-cover object-top" />
    <figcaption className="absolute inset-x-1 bottom-1 truncate text-center text-ios-caption-2 text-game-ink-secondary">
      Đối tượng
    </figcaption>
  </figure>
);
