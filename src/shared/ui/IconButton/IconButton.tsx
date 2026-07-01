import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from '../clsx';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: ReactNode;
  /** Required accessible name (icon-only buttons must be labelled). */
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = 'ghost', size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={clsx(styles.iconBtn, styles[variant], styles[size], className)}
      {...rest}
    >
      {icon}
    </button>
  );
});
