import { clsx } from '../clsx';
import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  if (src) {
    return <img className={clsx(styles.avatar, styles[size])} src={src} alt={name} />;
  }
  return (
    <span className={clsx(styles.avatar, styles[size], styles.fallback)} role="img" aria-label={name}>
      {getInitials(name)}
    </span>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
