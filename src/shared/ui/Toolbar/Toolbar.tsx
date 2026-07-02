import type { ReactNode } from 'react';
import styles from './Toolbar.module.css';

/** The list-page control row: search grows, filters keep their intrinsic size. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className={styles.toolbar}>{children}</div>;
}
