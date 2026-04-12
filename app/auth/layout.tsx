export const metadata = {
  title: 'Login - Patungan Kurban',
  description: 'Masuk ke dashboard panitia Patungan Kurban.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`.site-header,.site-footer{display:none;}`}</style>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
        {children}
      </div>
    </>
  );
}
