import { useRef, useState, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button, Field, IconButton, Input, ImageIcon, XIcon } from '@ui';
import { step5Schema, type Step5Values } from '../../api/facility.schema';
import type { CreateFacilityInput } from '../../api/facility.types';
import styles from './wizard.module.css';

const MAX_IMAGES = 6;

export interface Step5MediaProps {
  draft: Partial<CreateFacilityInput>;
  isCreating: boolean;
  onBack: (patch: Partial<CreateFacilityInput>) => void;
  onNext: (patch: Partial<CreateFacilityInput>) => void;
}

function isValidUrl(value: string): boolean {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
}

/** Wizard step 5 — photo URL strip (max 6) + optional verification document, then Create. */
export function Step5Media({ draft, isCreating, onBack, onNext }: Step5MediaProps) {
  const { t } = useTranslation();
  const [urlInput, setUrlInput] = useState('');
  const sampleCounter = useRef(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useForm<Step5Values>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      images: draft.images ?? [],
      documentName: draft.documentName ?? '',
      documentUrl: draft.documentUrl ?? '',
    },
  });

  const images = watch('images');
  const isFull = images.length >= MAX_IMAGES;

  const appendImage = (url: string) => {
    if (isFull) return;
    setValue('images', [...images, url], { shouldValidate: isSubmitted, shouldDirty: true });
  };

  const addTypedImage = () => {
    const url = urlInput.trim();
    if (!isValidUrl(url)) return;
    appendImage(url);
    setUrlInput('');
  };

  const addSampleImage = () => {
    let url = '';
    do {
      url = `https://picsum.photos/seed/bplay-new-${sampleCounter.current}/900/600`;
      sampleCounter.current += 1;
    } while (images.includes(url));
    appendImage(url);
  };

  const removeImage = (index: number) => {
    setValue(
      'images',
      images.filter((_, i) => i !== index),
      { shouldValidate: isSubmitted, shouldDirty: true },
    );
  };

  /** Enter in the URL input adds the photo instead of submitting the wizard. */
  const onUrlKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTypedImage();
    }
  };

  const toPatch = (values: Step5Values): Partial<CreateFacilityInput> => ({
    images: values.images,
    documentName: values.documentName?.trim() ? values.documentName.trim() : undefined,
    documentUrl: values.documentUrl?.trim() ? values.documentUrl.trim() : undefined,
  });

  const submit = handleSubmit((values) => onNext(toPatch(values)));

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.group} role="group" aria-label={t('facility.wizard.media.images')}>
        <span className={styles.groupLabel}>{t('facility.wizard.media.images')}</span>
        <p className={styles.hint}>{t('facility.wizard.media.imagesHint')}</p>
        <div className={styles.addRow}>
          <Input
            type="url"
            inputMode="url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            onKeyDown={onUrlKeyDown}
            placeholder={t('facility.wizard.media.imageUrl')}
            aria-label={t('facility.wizard.media.imageUrl')}
            data-testid="wizard-image-input"
          />
          <Button
            variant="secondary"
            onClick={addTypedImage}
            disabled={isFull || !isValidUrl(urlInput.trim())}
            data-testid="wizard-image-add"
          >
            {t('facility.wizard.media.addImage')}
          </Button>
          <Button
            variant="ghost"
            leftIcon={<ImageIcon />}
            onClick={addSampleImage}
            disabled={isFull}
            data-testid="wizard-image-sample"
          >
            {t('facility.wizard.media.addSample')}
          </Button>
        </div>

        {images.length > 0 && (
          <div className={styles.thumbs}>
            {images.map((url, index) => (
              <figure key={`${url}-${index}`} className={styles.thumb}>
                <img className={styles.thumbImg} src={url} alt="" loading="lazy" />
                <IconButton
                  size="sm"
                  icon={<XIcon />}
                  label={t('facility.wizard.media.remove')}
                  className={styles.thumbRemove}
                  onClick={() => removeImage(index)}
                  data-testid={`wizard-image-remove-${index}`}
                />
              </figure>
            ))}
          </div>
        )}

        {errors.images?.message && (
          <p className={styles.error} role="alert">
            {t(errors.images.message)}
          </p>
        )}
      </div>

      <h2 className={styles.stepTitle}>{t('facility.wizard.media.document')}</h2>
      <div className={styles.row}>
        <Field
          label={t('facility.wizard.media.documentName')}
          htmlFor="w-doc-name"
          error={errors.documentName ? t(errors.documentName.message ?? '') : undefined}
        >
          <Input id="w-doc-name" data-testid="wizard-doc-name" {...register('documentName')} />
        </Field>
        <Field
          label={t('facility.wizard.media.documentUrl')}
          htmlFor="w-doc-url"
          error={errors.documentUrl ? t(errors.documentUrl.message ?? '') : undefined}
        >
          <Input
            id="w-doc-url"
            type="url"
            inputMode="url"
            data-testid="wizard-doc-url"
            {...register('documentUrl')}
          />
        </Field>
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
        <Button type="submit" isLoading={isCreating} data-testid="wizard-create">
          {t('facility.wizard.create')}
        </Button>
      </footer>
    </form>
  );
}
