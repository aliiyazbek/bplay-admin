import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  Button,
  EmptyState,
  ReasonDialog,
  DocumentViewerModal,
  InboxIcon,
  ImageIcon,
  DocumentIcon,
  EyeIcon,
  CheckIcon,
  XIcon,
} from '@ui';
import { ownerDocBadgeVariant, type OwnerDocument } from '../api/owner.types';
import { useOwnerDocumentReview } from '../hooks/useOwnerDocumentReview';
import styles from './OwnerDocumentsCard.module.css';

interface Props {
  ownerId: string;
  documents: OwnerDocument[];
}

/** The owner's KYC documents — view each (image/PDF) and accept/reject with a reason. */
export function OwnerDocumentsCard({ ownerId, documents }: Props) {
  const { t } = useTranslation();
  const review = useOwnerDocumentReview();
  const [viewing, setViewing] = useState<OwnerDocument | null>(null);
  const [rejecting, setRejecting] = useState<OwnerDocument | null>(null);

  const accept = (document: OwnerDocument) =>
    review.mutate({ id: ownerId, documentId: document.id, action: 'accept' });

  const confirmReject = (reason: string) => {
    if (!rejecting) return;
    review.mutate(
      { id: ownerId, documentId: rejecting.id, action: 'reject', reason },
      { onSuccess: () => setRejecting(null) },
    );
  };

  return (
    <Card className={styles.card} data-testid="owner-detail-documents">
      <h2 className={styles.title}>{t('owner.profile.documents')}</h2>

      {documents.length === 0 ? (
        <EmptyState icon={<InboxIcon />} title={t('owner.profile.noDocuments')} />
      ) : (
        <ul className={styles.docs}>
          {documents.map((document) => (
            <li key={document.id} className={styles.doc}>
              <span className={styles.docIcon} aria-hidden>
                {document.kind === 'image' ? <ImageIcon /> : <DocumentIcon />}
              </span>
              <span className={styles.docMeta}>
                <span className={styles.docHead}>
                  <span className={styles.docName}>{t(`owner.doc.type.${document.type}`)}</span>
                  <Badge variant={ownerDocBadgeVariant(document.status)} size="sm">
                    {t(`owner.doc.status.${document.status}`)}
                  </Badge>
                </span>
                {document.status === 'rejected' && document.rejectionReason && (
                  <span className={styles.docReason}>“{document.rejectionReason}”</span>
                )}
              </span>
              <span className={styles.docActions}>
                {document.url && (
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<EyeIcon />}
                    onClick={() => setViewing(document)}
                    data-testid={`owner-doc-view-${document.id}`}
                  >
                    {t('owner.doc.view')}
                  </Button>
                )}
                {document.status !== 'accepted' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<CheckIcon />}
                    onClick={() => accept(document)}
                    disabled={review.isPending}
                    data-testid={`owner-doc-accept-${document.id}`}
                  >
                    {t('owner.doc.accept')}
                  </Button>
                )}
                {document.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="danger"
                    leftIcon={<XIcon />}
                    onClick={() => setRejecting(document)}
                    data-testid={`owner-doc-reject-${document.id}`}
                  >
                    {t('owner.doc.reject')}
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <DocumentViewerModal
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        url={viewing?.url}
        kind={viewing?.kind ?? 'pdf'}
        title={viewing ? t(`owner.doc.type.${viewing.type}`) : undefined}
        closeLabel={t('common.close')}
        openLabel={t('owner.doc.openTab')}
        emptyLabel={t('owner.doc.noPreview')}
        fallbackNote={t('owner.doc.pdfHint')}
      />

      <ReasonDialog
        isOpen={rejecting !== null}
        onClose={() => setRejecting(null)}
        onConfirm={confirmReject}
        title={t('owner.doc.rejectTitle')}
        description={
          rejecting
            ? t('owner.doc.rejectMessage', { type: t(`owner.doc.type.${rejecting.type}`) })
            : undefined
        }
        reasonLabel={t('owner.confirm.reasonLabel')}
        reasonPlaceholder={t('owner.confirm.reasonPlaceholder')}
        confirmText={t('owner.doc.reject')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={review.isPending}
      />
    </Card>
  );
}
