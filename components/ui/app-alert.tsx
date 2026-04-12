interface AppAlertProps {
  children: React.ReactNode;
  tone?: 'success' | 'error' | 'warning';
}

const toneClasses: Record<NonNullable<AppAlertProps['tone']>, string> = {
  success: 'alert alert-success',
  error: 'alert alert-error',
  warning: 'alert alert-warning',
};

export function AppAlert({ children, tone = 'success' }: AppAlertProps) {
  return <div className={toneClasses[tone]}>{children}</div>;
}
