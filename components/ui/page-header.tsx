import Link from 'next/link';

interface PageHeaderAction {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'muted';
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: PageHeaderAction[];
}

function getActionClassName(variant: PageHeaderAction['variant']) {
  if (variant === 'secondary') return 'button-secondary';
  if (variant === 'muted') return 'button-muted';
  return 'button-primary';
}

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <section className="panel overflow-hidden p-5 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="page-intro">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-copy">{description}</p> : null}
          {meta ? <div className="text-sm text-stone-500 dark:text-stone-400">{meta}</div> : null}
        </div>

        {actions?.length ? (
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {actions.map((action, index) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className={`
                  ${index === 0 ? 'bg-pine text-white dark:bg-pine dark:text-white' : 'border border-stone-200 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-200'}
                  inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition hover:opacity-90 lg:px-4 lg:py-2 lg:text-sm
                `}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
