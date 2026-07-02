import type { ReactNode } from 'react';
import { Modal } from '../Modal/Modal';
import styles from './ImageLightbox.module.css';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  /** Image source; when absent, `fallback` is shown instead. */
  src?: string;
  alt: string;
  title?: string;
  closeLabel?: string;
  /** Rendered when there is no `src` (e.g. an initials Avatar). */
  fallback?: ReactNode;
}

/**
 * A fullscreen-feel image viewer built on the shared Modal (so it inherits the
 * focus-trap, Esc/overlay close, and theme chrome). Shows the image contained at
 * a large size, or a fallback node when there is no image.
 */
export function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
  title,
  closeLabel,
  fallback,
}: ImageLightboxProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg" closeLabel={closeLabel}>
      <div className={styles.viewer}>
        {src ? <img className={styles.image} src={src} alt={alt} /> : fallback}
      </div>
    </Modal>
  );
}
