import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { PageContainer, PageHeader, Stepper } from '@ui';
import { PATHS } from '@app/router/paths';
import { useCreateFacility } from '../hooks/useCreateFacility';
import type { CreateFacilityInput } from '../api/facility.types';
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

/**
 * Add Facility wizard — a 5-step glass panel over the review-desk stage.
 * The page owns the draft (`Partial<CreateFacilityInput>`) and the active
 * index; every step is its own small RHF form seeded from the draft, so Back
 * keeps whatever was typed and Next only merges validated values.
 */
export default function AddFacilityWizardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const mutation = useCreateFacility();

  const [draft, setDraft] = useState<Partial<CreateFacilityInput>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const steps = useMemo(
    () => [
      { key: 'owner', label: t('facility.wizard.steps.owner') },
      { key: 'basics', label: t('facility.wizard.steps.basics') },
      { key: 'location', label: t('facility.wizard.steps.location') },
      { key: 'details', label: t('facility.wizard.steps.details') },
      { key: 'media', label: t('facility.wizard.steps.media') },
    ],
    [t],
  );

  const goToStep = (patch: Partial<CreateFacilityInput>, index: number) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setActiveIndex(index);
  };

  /** Step 1 merge — switching kind keeps shared fields but drops kind-specific ones. */
  const applyOwnerAndType = (patch: Partial<CreateFacilityInput>) => {
    setDraft((prev) => {
      const kindChanged =
        prev.kind !== undefined && patch.kind !== undefined && prev.kind !== patch.kind;
      const next: Partial<CreateFacilityInput> = { ...prev, ...patch };
      if (kindChanged) {
        for (const field of KIND_SPECIFIC_FIELDS) delete next[field];
        if (patch.kind === 'pitch' && next.sports && next.sports.length > 1) {
          next.sports = [next.sports[0]];
        }
      }
      return next;
    });
    setActiveIndex(1);
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
        {activeIndex === 0 && <Step1OwnerType draft={draft} onNext={applyOwnerAndType} />}
        {activeIndex === 1 && (
          <Step2Basics
            draft={draft}
            kind={kind}
            onBack={(patch) => goToStep(patch, 0)}
            onNext={(patch) => goToStep(patch, 2)}
          />
        )}
        {activeIndex === 2 && (
          <Step3Location
            draft={draft}
            onBack={(patch) => goToStep(patch, 1)}
            onNext={(patch) => goToStep(patch, 3)}
          />
        )}
        {activeIndex === 3 && (
          <Step4Details
            draft={draft}
            kind={kind}
            onBack={(patch) => goToStep(patch, 2)}
            onNext={(patch) => goToStep(patch, 4)}
          />
        )}
        {activeIndex === 4 && (
          <Step5Media
            draft={draft}
            isCreating={mutation.isPending}
            onBack={(patch) => goToStep(patch, 3)}
            onNext={createFacility}
          />
        )}
      </motion.section>
    </PageContainer>
  );
}
