import Image from 'next/image';

interface BrandLogoProps {
  markClassName?: string;
  textClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  titleAs?: 'p' | 'h1';
  priority?: boolean;
}

export function BrandLogo({
  markClassName = '',
  textClassName = '',
  eyebrowClassName = '',
  titleClassName = '',
  titleAs = 'p',
  priority = false,
}: BrandLogoProps) {
  const TitleTag = titleAs;

  return (
    <>
      <span className={`brand-logo-mark ${markClassName}`.trim()} aria-hidden="true">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={192}
          height={192}
          priority={priority}
          className="brand-logo-image rounded-[10px]"
          sizes="(max-width: 768px) 40px, 44px"
        />
      </span>
      <span className={`brand-logo-copy ${textClassName}`.trim()}>
        <span className={`brand-logo-eyebrow ${eyebrowClassName}`.trim()}>Patungan Kurban</span>
        <TitleTag className={`brand-logo-title ${titleClassName}`.trim()}>Masjid Nurul Huda</TitleTag>
      </span>
    </>
  );
}
