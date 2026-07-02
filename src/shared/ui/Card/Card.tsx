import type { HTMLAttributes } from 'react';
import { clsx } from '../clsx';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ padding = 'md', className, children, ...rest }: CardProps) {
  return (
    <div className={clsx(styles.card, styles[padding], className)} {...rest}>
      {children}
    </div>
  );
}
