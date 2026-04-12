import Link from 'next/link';

interface SidebarNavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export function SidebarNavLink({ href, label, icon, exact = false }: SidebarNavLinkProps) {
  const isActive = typeof window !== 'undefined' ? false : undefined;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
      data-nav-link
      data-href={href}
      data-exact={exact}
    >
      <span className="flex h-5 w-5 items-center justify-center text-stone-500 transition group-hover:text-pine [&.active]:text-pine">
        {icon}
      </span>
      <span className="text-stone-700 transition group-hover:text-pine [&.active]:text-pine [&.active]:font-semibold">
        {label}
      </span>
    </Link>
  );
}
