import { Modal } from '../Modal/Modal';
import { ExternalLinkIcon } from '../icons';
import styles from './DocumentViewer.module.css';

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The document source. When absent, `emptyLabel` is shown. */
  url?: string;
  /** Drives the render branch: an inline image vs an embedded PDF/file. */
  kind: 'image' | 'pdf';
  title?: string;
  alt?: string;
  closeLabel?: string;
  /** Label for the "open in a new tab" link (full-size / native viewer). */
  openLabel?: string;
  emptyLabel?: string;
  /** Hint shown under an embedded file (e.g. when a PDF preview may be blocked). */
  fallbackNote?: string;
}

/**
 * A viewer for an uploaded verification document, built on the shared Modal. An
 * image renders inline in a framed stage; a PDF/other file embeds in an iframe.
 * Either way an "open in a new tab" link gives the full native viewer (zoom,
 * download, print).
 */
export function DocumentViewerModal({
  isOpen,
  onClose,
  url,
  kind,
  title,
  alt,
  closeLabel,
  openLabel = 'Open in a new tab',
  emptyLabel = 'No document to display.',
  fallbackNote,
}: DocumentViewerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl" closeLabel={closeLabel}>
      <div className={styles.viewer}>
        {url && (
          <div className={styles.toolbar}>
            <a className={styles.open} href={url} target="_blank" rel="noreferrer">
              <ExternalLinkIcon />
              {openLabel}
            </a>
          </div>
        )}

        <div className={styles.stage}>
          {!url ? (
            <p className={styles.empty}>{emptyLabel}</p>
          ) : kind === 'image' ? (
            <img className={styles.image} src={url} alt={alt ?? title ?? ''} />
          ) : (
            <iframe className={styles.frame} src={url} title={title ?? 'document'} />
          )}
        </div>

        {url && kind === 'pdf' && fallbackNote && <p className={styles.note}>{fallbackNote}</p>}
      </div>
    </Modal>
  );
}
