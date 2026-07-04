import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { PageContainer, PageHeader, Stepper, MapPinIcon } from '@ui';
import { PATHS } from '@app/router/paths';
import { useCreateFacility } from '../hooks/useCreateFacility';
import type { CreateFacilityInput, FacilityRegionSeed } from '../api/facility.types';
import { Step1OwnerType } from '../components/wizard/Step1OwnerType';
import { Step2Basics } from '../components/wizard/Step2Basics';
import { Step3Location } from '../components/wizard/Step3Location';
import { Step4Details } from '../components/wizard/Step4Details';
import { Step5Media } from '../components/wizard/Step5Media';
import styles from './AddFacilityWizardPage.module.css';

/** Draft fields that stop making sense when the facility kind flips (club ⇄ pitch). */
const KIND_SPECIFIC_FIELDS = [
  'description',
  'workingHours',
  'pricePerHour',
  'capacity',
  'specs',
  'cancelPolicy',
] as const;

type StepKey = 'owner' | 'basics' | 'location' | 'details' | 'media';

/**
 * Add Facility wizard — a glass panel over the review-desk stage. The page owns
 * the draft (`Partial<CreateFacilityInput>`) and the active index; every step is
 * its own small RHF form seeded from the draft, so Back keeps whatever was typed
 * and Next only merges validated values.
 *
 * Opened from a region's detail page (router state carries a `region` seed), the
 * facility's coordinates are pre-filled from the region center and the standalone
 * location step is dropped — you land inside that region without re-entering it.
 */
export default function AddFacilityWizardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const reduceMotion = useReducedMotion();
  const mutation = useCreateFacility();

  const regionSeed =
    (routerLocation.state as { region?: FacilityRegionSeed } | null)?.region ?? null;

  // With a region seed the location is known, so that step is omitted.
  const stepKeys = useMemo<StepKey[]>(
    () =>
      regionSeed
        ? ['owner', 'basics', 'details', 'media']
        : ['owner', 'basics', 'location', 'details', 'media'],
    [regionSeed],
  );
  const steps = useMemo(
    () => stepKeys.map((key) => ({ key, label: t(`facility.wizard.steps.${key}`) })),
    [stepKeys, t],
  );

  const [draft, setDraft] = useState<Partial<CreateFacilityInput>>(() =>
    regionSeed
      ? {
          location: {
            lat: regionSeed.centerLat,
            lng: regionSeed.centerLng,
            address: regionSeed.name,
          },
        }
      : {},
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeKey = stepKeys[activeIndex];

  const goToStep = (patch: Partial<CreateFacilityInput>, index: number) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setActiveIndex(index);
  };
  /** Generic step nav — Back/Next just move one step in the current flow. */
  const next = (patch: Partial<CreateFacilityInput>) => goToStep(patch, activeIndex + 1);
  const back = (patch: Partial<CreateFacilityInput>) => goToStep(patch, activeIndex - 1);

  /** Step 1 merge — switching kind keeps shared fields but drops kind-specific ones. */
  const applyOwnerAndType = (patch: Partial<CreateFacilityInput>) => {
    setDraft((prev) => {
      const kindChanged =
        prev.kind !== undefined && patch.kind !== undefined && prev.kind !== patch.kind;
      const nextDraft: Partial<CreateFacilityInput> = { ...prev, ...patch };
      if (kindChanged) {
        for (const field of KIND_SPECIFIC_FIELDS) delete nextDraft[field];
        if (patch.kind === 'pitch' && nextDraft.sports && nextDraft.sports.length > 1) {
          nextDraft.sports = [nextDraft.sports[0]];
        }
      }
      return nextDraft;
    });
    setActiveIndex((index) => index + 1);
  };

  /** Step 5 submit — compose the full input from the validated draft and create. */
  const createFacility = (patch: Partial<CreateFacilityInput>) => {
    const merged = { ...draft, ...patch };
    if (
      !merged.ownerId ||
      !merged.kind ||
      !merged.name ||
      !merged.location ||
      !merged.sports?.length ||
      !merged.images?.length
    ) {
      return;
    }
    const input: CreateFacilityInput = {
      ownerId: merged.ownerId,
      kind: merged.kind,
      name: merged.name,
      description: merged.description,
      sports: merged.sports,
      contactPhone: merged.contactPhone,
      location: merged.location,
      workingHours: merged.workingHours,
      pricePerHour: merged.pricePerHour,
      capacity: merged.capacity,
      specs: merged.specs,
      cancelPolicy: merged.cancelPolicy,
      images: merged.images,
      documentName: merged.documentName,
      documentUrl: merged.documentUrl,
    };
    mutation.mutate(input, {
      onSuccess: (created) => navigate(`${PATHS.facilityManagement}/${created.id}`),
    });
  };

  const kind = draft.kind ?? 'club';

  return (
    <PageContainer>
      <PageHeader
        title={t('facility.wizard.title')}
        subtitle={t('facility.wizard.subtitle')}
        showBack
        backLabel={t('common.back')}
      />

      {regionSeed && (
        <div className={styles.regionSeed} data-testid="wizard-region-seed">
          <span className={styles.regionSeedIcon} aria-hidden>
            <MapPinIcon />
          </span>
          <div className={styles.regionSeedText}>
            <span className={styles.regionSeedTitle}>
              {t('facility.wizard.regionSeed.title', { region: regionSeed.name })}
            </span>
            <span className={styles.regionSeedHint}>{t('facility.wizard.regionSeed.hint')}</span>
          </div>
        </div>
      )}

      <div className={styles.stepperWrap}>
        <Stepper steps={steps} activeIndex={activeIndex} aria-label={t('facility.wizard.title')} />
      </div>

      <motion.section
        key={activeIndex}
        className={styles.panel}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        data-testid="wizard-panel"
      >
        {activeKey === 'owner' && <Step1OwnerType draft={draft} onNext={applyOwnerAndType} />}
        {activeKey === 'basics' && (
          <Step2Basics draft={draft} kind={kind} onBack={back} onNext={next} />
        )}
        {activeKey === 'location' && (
          <Step3Location draft={draft} onBack={back} onNext={next} />
        )}
        {activeKey === 'details' && (
          <Step4Details draft={draft} kind={kind} onBack={back} onNext={next} />
        )}
        {activeKey === 'media' && (
          <Step5Media
            draft={draft}
            isCreating={mutation.isPending}
            onBack={back}
            onNext={createFacility}
          />
        )}
      </motion.section>
    </PageContainer>
  );
}
