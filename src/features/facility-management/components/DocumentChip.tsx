import { useTranslation } from 'react-i18next';
import { DocumentIcon, clsx } from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';
import type { FacilityDocument } from '../api/facility.types';
import styles from './DocumentChip.module.css';

export interface DocumentChipProps {
  document: FacilityDocument;
}

/**
 * A verification document as a small glass chip that opens the file in a new
 * tab. The colored dot mirrors the document's review status (Badge palette).
 */
export function DocumentChip({ document }: DocumentChipProps) {
  const { t } = useTranslation();
  const statusVariant = statusToBadgeVariant(document.status);

  return (
    <a
      className={styles.chip}
      href={document.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${document.name} — ${t('facility.profile.openDocument')}`}
      data-testid={`document-chip-${document.id}`}
    >
      <DocumentIcon className={styles.icon} />
      <span className={styles.name}>{document.name}</span>
      <span className={clsx(styles.dot, styles[statusVariant])} aria-hidden />
      <span className={styles.srOnly}>{t(`status.${document.status}`)}</span>
    </a>
  );
}
