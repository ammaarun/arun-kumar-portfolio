import React, { useState, useEffect } from 'react';

/**
 * NeonPublicImage
 * ────────────────────────────────────────────────────────────────────────────
 * Renders an image that may be a:
 *   a) Plain URL            → direct <img src>  (unchanged, backward-compatible)
 *   b) neon::<mediaId> ref → fetches /api/portfolio/media/:mediaId which
 *                             redirects 302 to a short-lived presigned URL.
 *                             The <img> follows the redirect automatically.
 *
 * On error (deleted asset, expired record, etc.) renders the fallback prop
 * instead of crashing. This keeps the rest of the portfolio page intact.
 *
 * Props:
 *   src       {string}  — either a plain URL or "neon::<mediaId>"
 *   alt       {string}
 *   className {string}
 *   fallback  {React.ReactNode} — rendered when src is absent or broken
 */
export const NeonPublicImage = ({ src, alt = '', className = '', fallback = null }) => {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) {
      setResolvedSrc(null);
      setFailed(false);
      return;
    }

    if (src.startsWith('neon::')) {
      // Resolve via public API — the endpoint does a 302 redirect to a presigned URL.
      // We build the fetch URL server-side so the <img> just needs a plain https URL.
      const mediaId = src.replace('neon::', '');
      setResolvedSrc(null);
      setFailed(false);

      // We pass the resolved public endpoint URL directly to the img tag.
      // The browser <img> will follow the 302 redirect automatically.
      setResolvedSrc(`/api/portfolio/media/${encodeURIComponent(mediaId)}`);
    } else {
      // Plain URL — use as-is
      setResolvedSrc(src);
      setFailed(false);
    }
  }, [src]);

  if (!src || !resolvedSrc) return fallback || null;
  if (failed) return fallback || null;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};
