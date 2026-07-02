import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from '../clsx';
import styles from './Tabs.module.css';

export interface TabItem {
  key: string;
  label: ReactNode;
  badge?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  'aria-label'?: string;
}

/**
 * Pill tabs on a raised rail. Roving-tabindex tablist with full arrow-key
 * navigation (RTL-aware, Home/End). The active pill glides between tabs via a
 * framer-motion layoutId indicator (skipped under reduced motion).
 */
export function Tabs({ items, value, onChange, 'aria-label': ariaLabel }: TabsProps) {
  const reduceMotion = useReducedMotion();
  const indicatorId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const selectAt = (index: number) => {
    const item = items[index];
    if (!item) return;
    onChange(item.key);
    tabRefs.current.get(item.key)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) return;
    const current = Math.max(
      items.findIndex((item) => item.key === value),
      0,
    );
    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = isRtl ? -1 : 1;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        selectAt((current + forward + items.length) % items.length);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        selectAt((current - forward + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        selectAt(0);
        break;
      case 'End':
        event.preventDefault();
        selectAt(items.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div role="tablist" aria-label={ariaLabel} className={styles.tablist} onKeyDown={onKeyDown}>
      {items.map((item) => {
        const isActive = item.key === value;
        return (
          <button
            key={item.key}
            ref={(node) => {
              if (node) tabRefs.current.set(item.key, node);
              else tabRefs.current.delete(item.key);
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={clsx(
              styles.tab,
              isActive && styles.active,
              isActive && reduceMotion && styles.staticActive,
            )}
            onClick={() => onChange(item.key)}
            data-testid={`tab-${item.key}`}
          >
            {isActive && !reduceMotion && (
              <motion.span
                layoutId={indicatorId}
                className={styles.indicator}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                aria-hidden
              />
            )}
            <span className={styles.content}>
              {item.label}
              {typeof item.badge === 'number' && (
                <span className={styles.badge}>{item.badge}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
