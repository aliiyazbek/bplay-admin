import { Modal } from '../Modal/Modal';
import { ExternalLinkIcon } from '../icons';
import { isSameOriginUrl, safeHttpUrl } from '@shared/utils/url';
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
 * A viewer for an uploaded document, built on the shared Modal. An image renders
 * inline in a framed stage; a PDF/other file embeds in an iframe. Either way an
 * "open in a new tab" link gives the full native viewer (zoom, download, print).
 *
 * SECURITY: the document is USER-UPLOADED, so `url` is untrusted.
 *  - it goes through `safeHttpUrl()`, which rejects anything that is not
 *    http/https or a same-origin path (a `javascript:` document would otherwise
 *    run on click, and the admin's token lives in localStorage);
 *  - the iframe is `sandbox`ed with no tokens, so an uploaded HTML file served
 *    from our own origin cannot run script, submit forms, or reach that storage;
 *  - "open in a new tab" would bypass that sandbox for a same-origin upload, so
 *    for same-origin sources the link DOWNLOADS instead of navigating.
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
  const src = safeHttpUrl(url);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl" closeLabel={closeLabel}>
      <div className={styles.viewer}>
        {src && (
          <div className={styles.toolbar}>
            <a
              className={styles.open}
              href={src}
              target="_blank"
              rel="noreferrer"
              // Same-origin uploads are saved, not opened: navigating to one at
              // top level would run it in this origin and defeat the sandbox.
              download={isSameOriginUrl(src) ? (title ?? '') : undefined}
            >
              <ExternalLinkIcon />
              {openLabel}
            </a>
          </div>
        )}

        <div className={styles.stage}>
          {!src ? (
            <p className={styles.empty}>{emptyLabel}</p>
          ) : kind === 'image' ? (
            <img className={styles.image} src={src} alt={alt ?? title ?? ''} />
          ) : (
            <iframe
              className={styles.frame}
              src={src}
              title={title ?? 'document'}
              // `allow-scripts` WITHOUT `allow-same-origin` keeps the built-in PDF
              // viewer working while putting the frame in an opaque origin, so an
              // uploaded HTML file cannot read this origin's localStorage token.
              // Granting both together would undo the sandbox entirely.
              sandbox="allow-scripts"
            />
          )}
        </div>

        {src && kind === 'pdf' && fallbackNote && <p className={styles.note}>{fallbackNote}</p>}
      </div>
    </Modal>
  );
}
