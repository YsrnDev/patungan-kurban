'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavPillLinkProps {
  href: string;
  label: string;
  exact?: boolean;
}

export function NavPillLink({ href, label, exact = false }: NavPillLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const className = `nav-pill ${isActive ? 'nav-pill-active' : 'nav-pill-inactive'}`;

  return (
    <Link href={href} className={className} aria-current={isActive ? 'page' : undefined}>
      {label}
    </Link>
  );
}
