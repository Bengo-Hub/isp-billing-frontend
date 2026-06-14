import Image from 'next/image';
import Link from 'next/link';

/**
 * Codevertex wordmark logo.
 *
 * Renders the official logo (public/images/logo/logo.png, ~821x488) at a
 * responsive height with auto width, so it adapts to its container instead of
 * forcing a fixed pixel box. `className` lets callers tune the height per slot
 * (e.g. a compact header vs a large auth page).
 */
export default function Brand({
  href = '/',
  className = 'h-9 sm:h-10',
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Codevertex home">
      <Image
        src="/images/logo/logo.png"
        alt="Codevertex"
        width={821}
        height={488}
        priority
        className={`${className} w-auto object-contain`}
      />
    </Link>
  );
}
