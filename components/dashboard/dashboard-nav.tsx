'use client';

import type { LucideIcon } from 'lucide-react';
import { FileText, FolderOpen, LayoutGrid, Shield, Users } from 'lucide-react';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutGrid,
    exact: true,
  },
  {
    href: '/dashboard/groups',
    label: 'Grup',
    icon: FolderOpen,
  },
  {
    href: '/dashboard/participants',
    label: 'Peserta',
    icon: Users,
  },
  {
    href: '/dashboard/reports',
    label: 'Laporan',
    icon: FileText,
  },
  {
    href: '/dashboard/staff',
    label: 'Staff',
    icon: Shield,
    adminOnly: true,
  },
];

export function getVisibleDashboardNavItems(isAdmin: boolean) {
  return dashboardNavItems.filter((item) => !item.adminOnly || isAdmin);
}
