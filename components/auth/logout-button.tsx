import { logoutAction } from '@/lib/actions';

interface LogoutButtonProps {
  className?: string;
  formClassName?: string;
  iconOnly?: boolean;
  iconClassName?: string;
  onClick?: () => void;
}

export function LogoutButton({ className, formClassName, iconOnly = false, iconClassName = 'h-4 w-4', onClick }: LogoutButtonProps) {
  return (
    <form action={logoutAction} className={formClassName}>
      <button
        type="submit"
        className={className ?? 'button-secondary'}
        onClick={onClick}
        aria-label="Logout"
        title="Logout"
      >
        {iconOnly ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9.75m0 0 2.625-2.625M9.75 12l2.625 2.625" />
            </svg>
            <span className="sr-only">Logout</span>
          </>
        ) : (
          'Logout'
        )}
      </button>
    </form>
  );
}
