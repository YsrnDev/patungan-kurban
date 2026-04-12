import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  const Wrapper = action?.href ? 'a' : action?.onClick ? 'button' : 'div';
  const wrapperProps = action?.href
    ? { href: action.href, className: 'block' }
    : action?.onClick
      ? { onClick: action.onClick, className: 'w-full text-left' }
      : {};

  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-state-icon">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <Wrapper {...wrapperProps}>
          <span className="empty-state-action">{action.label}</span>
        </Wrapper>
      )}
    </div>
  );
}

interface TableEmptyStateProps {
  colSpan: number;
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function TableEmptyState({ colSpan, icon: Icon, title, description }: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8">
        <div className="empty-state empty-state-compact">
          {Icon && (
            <div className="empty-state-icon-small">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <h3 className="empty-state-title-small">{title}</h3>
          {description && <p className="empty-state-description-small">{description}</p>}
        </div>
      </td>
    </tr>
  );
}
