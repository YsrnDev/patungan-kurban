export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer border-t border-white/60 bg-sand/70 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/60">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 text-center text-sm text-stone-500 sm:px-6 lg:px-8 dark:text-stone-400">
        <p>&copy; {currentYear} Patungan Kurban. Semua hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
