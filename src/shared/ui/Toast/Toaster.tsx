import { useToastStore } from './toast';
import styles from './Toaster.module.css';

/** Mounts once at the app root (in AppProviders). Renders the live toast stack. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className={styles.host} role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${styles.toast} ${styles[t.variant]}`}
          onClick={() => dismiss(t.id)}
          data-testid={`toast-${t.variant}`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
