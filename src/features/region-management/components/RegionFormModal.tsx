import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Modal, Field, Input, Select, Button } from '@ui';
import { regionFormSchema, type RegionFormValues } from '../api/region.schema';
import { useCreateRegion, useUpdateRegion } from '../hooks/useRegionMutations';
import type { Region } from '../api/region.types';
import styles from './regionForm.module.css';

interface CityOption {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  region: Region | null;
  cities: CityOption[];
}

export function RegionFormModal({ isOpen, onClose, region, cities }: Props) {
  const { t } = useTranslation();
  const createMutation = useCreateRegion();
  const updateMutation = useUpdateRegion();
  const isEditing = region !== null;
  const mutation = isEditing ? updateMutation : createMutation;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: { name: '', type: 'city', cityId: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        region
          ? { name: region.name, type: region.type, cityId: region.cityId ?? '' }
          : { name: '', type: 'city', cityId: '' },
      );
    }
  }, [isOpen, region, reset]);

  const type = watch('type');

  const submit = handleSubmit(async (values) => {
    const input = {
      name: values.name,
      type: values.type,
      cityId: values.type === 'neighborhood' ? values.cityId : undefined,
    };
    if (region) {
      await updateMutation.mutateAsync({ id: region.id, input });
    } else {
      await createMutation.mutateAsync(input);
    }
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t(isEditing ? 'region.form.editTitle' : 'region.form.createTitle')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="region-form" isLoading={mutation.isPending}>
            {t(isEditing ? 'region.form.saveSubmit' : 'region.form.createSubmit')}
          </Button>
        </>
      }
    >
      <form id="region-form" className={styles.form} onSubmit={submit} noValidate>
        <Field
          label={t('region.form.name')}
          htmlFor="r-name"
          error={errors.name ? t(errors.name.message ?? '') : undefined}
        >
          <Input id="r-name" {...register('name')} />
        </Field>
        <Field
          label={t('region.form.type')}
          htmlFor="r-type"
          error={errors.type ? t(errors.type.message ?? '') : undefined}
        >
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                id="r-type"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={[
                  { value: 'city', label: t('region.type.city') },
                  { value: 'neighborhood', label: t('region.type.neighborhood') },
                ]}
              />
            )}
          />
        </Field>
        {type === 'neighborhood' && (
          <Field
            label={t('region.form.city')}
            htmlFor="r-city"
            error={errors.cityId ? t(errors.cityId.message ?? '') : undefined}
          >
            <Controller
              control={control}
              name="cityId"
              render={({ field }) => (
                <Select
                  id="r-city"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('region.form.cityPlaceholder')}
                  options={cities.map((city) => ({ value: city.id, label: city.name }))}
                />
              )}
            />
          </Field>
        )}
      </form>
    </Modal>
  );
}
