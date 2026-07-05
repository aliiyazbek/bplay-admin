import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button, FileUpload, type UploadedFile } from '@ui';
import { step5Schema, type Step5Values } from '../../api/facility.schema';
import type { CreateFacilityInput } from '../../api/facility.types';
import styles from './wizard.module.css';

const MAX_IMAGES = 6;

export interface Step5MediaProps {
  draft: Partial<CreateFacilityInput>;
  isSubmitting: boolean;
  submitLabel: string;
  onBack: (patch: Partial<CreateFacilityInput>) => void;
  onNext: (patch: Partial<CreateFacilityInput>) => void;
}

/** Wizard final step — upload photos (max 6, reorderable) + verification documents. */
export function Step5Media({ draft, isSubmitting, submitLabel, onBack, onNext }: Step5MediaProps) {
  const { t } = useTranslation();

  const {
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<Step5Values>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      images: draft.images ?? [],
      documents: draft.documents ?? [],
    },
  });

  const images = watch('images');
  const documents = watch('documents') ?? [];

  const imageFiles: UploadedFile[] = images.map((url, index) => ({
    url,
    name: `${t('facility.wizard.media.photo')} ${index + 1}`,
  }));
  const documentFiles: UploadedFile[] = documents.map((doc) => ({ url: doc.url, name: doc.name }));

  const onImagesChange = (files: UploadedFile[]) =>
    setValue(
      'images',
      files.map((file) => file.url),
      { shouldValidate: isSubmitted, shouldDirty: true },
    );

  const onDocumentsChange = (files: UploadedFile[]) =>
    setValue(
      'documents',
      files.map((file) => ({ name: file.name, url: file.url })),
      { shouldDirty: true },
    );

  const toPatch = (values: Step5Values): Partial<CreateFacilityInput> => ({
    images: values.images,
    documents: values.documents,
  });

  const submit = handleSubmit((values) => onNext(toPatch(values)));

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.group} role="group" aria-label={t('facility.wizard.media.images')}>
        <span className={styles.groupLabel}>{t('facility.wizard.media.images')}</span>
        <p className={styles.hint}>{t('facility.wizard.media.imagesHint')}</p>
        <FileUpload
          variant="image"
          value={imageFiles}
          onChange={onImagesChange}
          maxFiles={MAX_IMAGES}
          accept="image/*"
          dropLabel={t('facility.wizard.media.drop')}
          browseLabel={t('facility.wizard.media.browse')}
          hint={t('facility.wizard.media.imageTypes')}
          removeLabel={t('facility.wizard.media.remove')}
          coverLabel={t('facility.wizard.media.cover')}
          moveEarlierLabel={t('facility.wizard.media.moveEarlier')}
          moveLaterLabel={t('facility.wizard.media.moveLater')}
          maxReachedLabel={t('facility.wizard.media.imagesMax')}
          testId="wizard-images"
        />
        {errors.images?.message && (
          <p className={styles.error} role="alert">
            {t(errors.images.message)}
          </p>
        )}
      </div>

      <div className={styles.group} role="group" aria-label={t('facility.wizard.media.documents')}>
        <span className={styles.groupLabel}>{t('facility.wizard.media.documents')}</span>
        <p className={styles.hint}>{t('facility.wizard.media.documentsHint')}</p>
        <FileUpload
          variant="document"
          value={documentFiles}
          onChange={onDocumentsChange}
          accept=".pdf,image/*"
          dropLabel={t('facility.wizard.media.docDrop')}
          browseLabel={t('facility.wizard.media.browse')}
          hint={t('facility.wizard.media.docTypes')}
          removeLabel={t('facility.wizard.media.remove')}
          testId="wizard-docs"
        />
      </div>

      <footer className={styles.footer}>
        <Button
          variant="ghost"
          className={styles.footerBack}
          onClick={() => onBack(toPatch(getValues()))}
          data-testid="wizard-back"
        >
          {t('facility.wizard.back')}
        </Button>
        <Button type="submit" isLoading={isSubmitting} data-testid="wizard-create">
          {submitLabel}
        </Button>
      </footer>
    </form>
  );
}
