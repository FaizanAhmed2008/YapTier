interface GlyphProps {
  className?: string;
}

function baseProps(className?: string) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };
}

export function UploadGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M12 16V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function SearchGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function TextGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M5 6.5V5h14v1.5" />
      <path d="M12 5v14" />
      <path d="M9 19h6" />
    </svg>
  );
}

export function SparklesGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M19 16.5v3" />
      <path d="M17.5 18h3" />
    </svg>
  );
}

export function TrashGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="m6.5 7 .8 11.1A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.9L17.5 7" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

export function CloseGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

export function ImageGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 4.5-4.5 3.5 3.5 2.5-2.5L20 18" />
    </svg>
  );
}

export function AlertGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M12 4.5 21 20H3L12 4.5Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}

export function CheckGlyph({ className }: GlyphProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
