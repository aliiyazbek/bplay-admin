import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import { Button, Field, Input, Select } from '@ui';
import { step3Schema, type Step3Values } from '../../api/facility.schema';
import { SYRIAN_GOVERNORATES, type CreateFacilityInput } from '../../api/facility.types';
import { StaticMapPin } from '../StaticMapPin';
import styles from './wizard.module.css';

/** Raw (pre-coercion) form values — lat/lng arrive as strings from the inputs. */
type Step3Input = z.input<typeof step3Schema>;

export interface Step3LocationProps {
  draft: Partial<CreateFacilityInput>;
  onBack: (patch: Partial<CreateFacilityInput>) => void;
  onNext: (patch: Partial<CreateFacilityInput>) => void;
}

/** NaN while typing is fine — StaticMapPin renders an em-dash until both parse. */
function toCoord(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
}

/** Wizard step 3 — governorate/city/district/address + coordinates with live pin preview. */
export function Step3Location({ draft, onBack, onNext }: Step3LocationProps) {
  const { t } = useTranslation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<Step3Input, unknown, Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      governorate: draft.location?.governorate ?? 'damascus',
      city: draft.location?.city ?? '',
      district: draft.location?.district ?? '',
      address: draft.location?.address ?? '',
      lat: draft.location && Number.isFinite(draft.location.lat) ? draft.location.lat : '',
      lng: draft.location && Number.isFinite(draft.location.lng) ? draft.location.lng : '',
    },
  });

  const lat = toCoord(watch('lat'));
  const lng = toCoord(watch('lng'));

  const toPatch = (values: Step3Input): Partial<CreateFacilityInput> => ({
    location: {
      lat: toCoord(values.lat),
      lng: toCoord(values.lng),
      address: values.address,
      city: values.city,
      district: values.district,
      governorate: values.governorate,
    },
  });

  const submit = handleSubmit((values) => onNext(toPatch(values)));

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <Field
        label={t('facility.wizard.location.governorate')}
        htmlFor="w-governorate"
        required
        error={errors.governorate ? t(errors.governorate.message ?? '') : undefined}
      >
        <Controller
          control={control}
          name="governorate"
          render={({ field }) => (
            <Select
              id="w-governorate"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-label={t('facility.wizard.location.governorate')}
              options={SYRIAN_GOVERNORATES.map((governorate) => ({
                value: governorate,
                label: t(`facility.governorate.${governorate}`),
              }))}
            />
          )}
        />
      </Field>

      <div className={styles.row}>
        <Field
          label={t('facility.wizard.location.city')}
          htmlFor="w-city"
          required
          error={errors.city ? t(errors.city.message ?? '') : undefined}
        >
          <Input id="w-city" data-testid="wizard-city" {...register('city')} />
        </Field>
        <Field
          label={t('facility.wizard.location.district')}
          htmlFor="w-district"
          required
          error={errors.district ? t(errors.district.message ?? '') : undefined}
        >
          <Input id="w-district" data-testid="wizard-district" {...register('district')} />
        </Field>
      </div>

      <Field
        label={t('facility.wizard.location.address')}
        htmlFor="w-address"
        required
        error={errors.address ? t(errors.address.message ?? '') : undefined}
      >
        <Input id="w-address" data-testid="wizard-address" {...register('address')} />
      </Field>

      <div className={styles.group}>
        <div className={styles.row}>
          <Field
            label={t('facility.wizard.location.lat')}
            htmlFor="w-lat"
            required
            error={errors.lat ? t(errors.lat.message ?? '') : undefined}
          >
            <Input
              id="w-lat"
              type="number"
              step="any"
              inputMode="decimal"
              data-testid="wizard-lat"
              {...register('lat')}
            />
          </Field>
          <Field
            label={t('facility.wizard.location.lng')}
            htmlFor="w-lng"
            required
            error={errors.lng ? t(errors.lng.message ?? '') : undefined}
          >
            <Input
              id="w-lng"
              type="number"
              step="any"
              inputMode="decimal"
              data-testid="wizard-lng"
              {...register('lng')}
            />
          </Field>
        </div>
        <p className={styles.hint}>{t('facility.wizard.location.hint')}</p>
      </div>

      <StaticMapPin lat={lat} lng={lng} />

      <footer className={styles.footer}>
        <Button
          variant="ghost"
          className={styles.footerBack}
          onClick={() => onBack(toPatch(getValues()))}
          data-testid="wizard-back"
        >
          {t('facility.wizard.back')}
        </Button>
        <Button type="submit" data-testid="wizard-next">
          {t('facility.wizard.next')}
        </Button>
      </footer>
    </form>
  );
}
