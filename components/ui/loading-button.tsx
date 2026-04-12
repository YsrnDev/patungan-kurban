'use client';

import { useState } from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'muted' | 'danger';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
}

const variantClassMap: Record<NonNullable<LoadingButtonProps['variant']>, string> = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  muted: 'button-muted',
  danger: 'button-danger',
};

const sizeClassMap: Record<NonNullable<LoadingButtonProps['size']>, string> = {
  default: '',
  sm: 'px-3 py-2 text-xs',
  lg: 'px-6 py-4 text-base',
};

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isProcessing = loading || isLoading;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isProcessing) return;

    if (onClick) {
      const result = onClick(event);

      // Handle async onClick
      if (result !== undefined && result !== null && typeof (result as { then?: unknown }).then === 'function') {
        setIsLoading(true);
        (result as Promise<unknown>).finally(() => {
          setIsLoading(false);
        });
      }
    }
  };

  return (
    <button
      className={`${variantClassMap[variant]} ${sizeClassMap[size]} ${fullWidth ? 'w-full' : ''} ${className} loading-button`}
      disabled={disabled || isProcessing}
      onClick={handleClick}
      aria-busy={isProcessing}
      {...props}
    >
      {isProcessing && (
        <svg
          className="loading-spinner mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{isProcessing ? (loadingText || children) : children}</span>
    </button>
  );
}

export function FormLoadingButton({
  children,
  loadingText = 'Memproses...',
  variant = 'primary',
  size = 'default',
  fullWidth = true,
}: Omit<LoadingButtonProps, 'loading' | 'onClick'>) {
  return (
    <LoadingButton
      type="submit"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loadingText={loadingText}
    >
      {children}
    </LoadingButton>
  );
}
