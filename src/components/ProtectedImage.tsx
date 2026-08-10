import { useState } from "react";

interface ProtectedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Marks the image as LCP candidate (disables lazy loading). */
  priority?: boolean;
}

const FALLBACK = "/placeholder.svg";

/** Only local assets get a .webp sibling — remote URLs are used as-is. */
const webpFor = (src: string) =>
  !/^https?:/i.test(src) && /\.(jpe?g|png)$/i.test(src) ? src.replace(/\.(jpe?g|png)$/i, ".webp") : null;

/**
 * Image with WebP preference, lazy decoding, broken-image fallback and
 * light anti-scraping protection (no drag, no selection, no context menu).
 */
const ProtectedImage = ({ src, alt, className, priority }: ProtectedImageProps) => {
  const [failed, setFailed] = useState(false);
  const source = !failed && src ? src : FALLBACK;
  const webp = failed ? null : webpFor(source);

  return (
    <picture onContextMenu={(e) => e.preventDefault()}>
      {webp && <source srcSet={webp} type="image/webp" />}
      <img
        src={source}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        onError={() => setFailed(true)}
        className={`select-none [-webkit-user-drag:none] ${className ?? ""} ${
          failed ? "object-contain p-8 opacity-40" : ""
        }`}
      />
    </picture>
  );
};

export default ProtectedImage;
