import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getCurrentUser } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <SiteHeader isAuthenticated={Boolean(currentUser)} />
      {children}
      <SiteFooter />
    </>
  );
}
