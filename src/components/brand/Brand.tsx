import Image from 'next/image';
import Link from 'next/link';

export default function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center">
      <div className="relative w-48 h-24">
        <Image
          src="/images/logo/logo.png"
          alt="CodeVertex IT Solutions"
          fill
          sizes="(min-width: 1024px) 16rem, 100vw"
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}