'use client';

import { useState } from 'react';

interface AvatarProps {
  /** Used for the initials fallback and the accessible label */
  name: string;
  src?: string | null;
  size?: number;
  /** Leave empty when the name is already shown next to the avatar (decorative image) */
  alt?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0]?.[0]];
  return letters.filter(Boolean).join('').toUpperCase() || '?';
}

export function Avatar({ name, src, size = 40, alt = '' }: AvatarProps) {
  // Remember which URL failed, so a new photo (new URL) gets a fresh chance to load
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  const style = { width: size, height: size };

  if (showImage) {
    return (
      // A plain <img> on purpose: the 256 px WebP is already small and served from Cloudinary's CDN,
      // so Next's image optimizer would only add an extra hop
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src as string}
        alt={alt}
        width={size}
        height={size}
        style={style}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src as string)}
        className="shrink-0 rounded-full bg-gray-100 object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: Math.max(10, Math.round(size / 2.5)) }}
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600"
    >
      {getInitials(name)}
    </span>
  );
}
