import type { ReactNode } from 'react';
import { ErrorState } from '../ErrorState/ErrorState';
import { EmptyState } from '../EmptyState/EmptyState';
import { clsx } from '../clsx';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  align?: 'start' | 'center' | 'end';
  /** Runtime column width (e.g. "160px" | "20%"); applied as an inline style. */
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyState?: ReactNode;
  getRowId: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
}

const SKELETON_ROWS = 6;

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  error,
  onRetry,
  emptyState,
  getRowId,
  rowActions,
}: DataTableProps<T>) {
  const colCount = columns.length + (rowActions ? 1 : 0);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={clsx(styles.th, column.align && styles[column.align])}
                style={column.width ? { inlineSize: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
            {rowActions && <th scope="col" className={clsx(styles.th, styles.end)} aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className={styles.row}>
                {Array.from({ length: colCount }, (_, cellIndex) => (
                  <td key={cellIndex} className={styles.td}>
                    <span className={styles.skeleton} />
                  </td>
                ))}
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={colCount} className={styles.state}>
                <ErrorState message={error} onRetry={onRetry} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount} className={styles.state}>
                {emptyState ?? <EmptyState title="Nothing here yet" />}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = getRowId(row);
              return (
                <tr key={id} className={styles.row} data-testid={`row-${id}`}>
                  {columns.map((column) => (
                    <td key={column.key} className={clsx(styles.td, column.align && styles[column.align])}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                  {rowActions && (
                    <td className={clsx(styles.td, styles.end, styles.actions)}>{rowActions(row)}</td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
