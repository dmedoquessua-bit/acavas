import { useCallback } from "react";

interface ProtectedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Marks the image as LCP candidate (disables lazy loading). */
  priority?: boolean;
}

const FALLBACK = "/placeholder.svg";

/** Derives a .webp sibling for local/uploaded assets so <picture> can prefer it. */
const webpFor = (src: string) =>
  /\.(jpe?g|png)$/i.test(src) ? src.replace(/\.(jpe?g|png)$/i, ".webp") : null;

/**
 * Image with WebP preference, lazy decoding, broken-image fallback and
 * light anti-scraping protection (no drag, no selection, no context menu).
 */
const ProtectedImage = ({ src, alt, className, priority }: ProtectedImageProps) => {
  const source = src || FALLBACK;
  const webp = webpFor(source);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src.endsWith(FALLBACK)) return;
    img.src = FALLBACK;
    img.classList.add("object-contain", "p-6", "opacity-60");
  }, []);

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
        onError={handleError}
        className={`select-none [-webkit-user-drag:none] ${className ?? ""}`}
      />
    </picture>
  );
};

export default ProtectedImage;
