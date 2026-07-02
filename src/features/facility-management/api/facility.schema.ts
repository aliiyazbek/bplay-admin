import { z } from 'zod';

// Enum schemas kept in sync with facility.types (literal tuples for zod).
const kindEnum = z.enum(['club', 'pitch']);
const sportEnum = z.enum(['tennis', 'padel', 'football', 'basketball', 'swimming', 'volleyball']);
const surfaceEnum = z.enum(['grass', 'artificial', 'hardcourt', 'clay', 'sand']);
const governorateEnum = z.enum([
  'damascus',
  'rif_dimashq',
  'aleppo',
  'homs',
  'hama',
  'latakia',
  'tartus',
  'idlib',
  'daraa',
  'as_suwayda',
  'quneitra',
  'deir_ez_zor',
  'al_hasakah',
  'raqqa',
]);

/** Empty/NaN inputs become undefined so optional numeric fields stay optional. */
const optionalPositiveInt = z.preprocess(
  (value) =>
    value === '' || value === null || (typeof value === 'number' && Number.isNaN(value))
      ? undefined
      : value,
  z.coerce.number().int().positive().optional(),
);

// ---------------------------------------------------------------------------
// Step 1 — owner & type
// ---------------------------------------------------------------------------

export const step1Schema = z.object({
  ownerId: z.string().min(1, 'facility.wizard.errors.owner'),
  kind: kindEnum,
});
export type Step1Values = z.infer<typeof step1Schema>;

// ---------------------------------------------------------------------------
// Step 2 — basics (one schema for both kinds; pitch stores [sport])
// ---------------------------------------------------------------------------

export const step2Schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'facility.wizard.errors.name')
    .max(60, 'facility.wizard.errors.name'),
  description: z.string().max(500).optional(),
  sports: z.array(sportEnum).min(1, 'facility.wizard.errors.sports'),
  contactPhone: z
    .union([z.string().regex(/^[0-9+\s-]{8,}$/, 'facility.wizard.errors.phone'), z.literal('')])
    .optional(),
});
export type Step2Values = z.infer<typeof step2Schema>;

// ---------------------------------------------------------------------------
// Step 3 — location (flat fields; the wizard merges them into `location`)
// ---------------------------------------------------------------------------

export const step3Schema = z.object({
  governorate: governorateEnum,
  city: z.string().trim().min(2, 'facility.wizard.errors.city'),
  district: z.string().trim().min(2, 'facility.wizard.errors.district'),
  address: z.string().trim().min(5, 'facility.wizard.errors.address'),
  lat: z.coerce.number().min(-90, 'facility.wizard.errors.lat').max(90, 'facility.wizard.errors.lat'),
  lng: z.coerce
    .number()
    .min(-180, 'facility.wizard.errors.lng')
    .max(180, 'facility.wizard.errors.lng'),
});
export type Step3Values = z.infer<typeof step3Schema>;

// ---------------------------------------------------------------------------
// Step 4 — details (pitch vs club)
// ---------------------------------------------------------------------------

const specsSchema = z.object({
  surface: surfaceEnum,
  isIndoor: z.boolean(),
  hasLighting: z.boolean(),
  hasParking: z.boolean(),
  hasLockerRoom: z.boolean(),
  hasCafe: z.boolean(),
});

const cancelPolicySchema = z.object({
  freeHoursBefore: z.coerce.number().int().min(0),
  penaltyPercent: z.coerce.number().min(0).max(100),
});

export const step4PitchSchema = z.object({
  pricePerHour: z.coerce.number().positive('facility.wizard.errors.price'),
  capacity: optionalPositiveInt,
  specs: specsSchema,
  cancelPolicy: cancelPolicySchema,
});
export type Step4PitchValues = z.infer<typeof step4PitchSchema>;

const dayHoursSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export const step4ClubSchema = z.object({
  workingHours: z
    .record(z.string(), dayHoursSchema)
    .refine(
      (hours) =>
        Object.values(hours).some(
          (day) => day.isOpen && Boolean(day.openTime) && Boolean(day.closeTime),
        ),
      'facility.wizard.errors.workingHours',
    ),
});
export type Step4ClubValues = z.infer<typeof step4ClubSchema>;

// ---------------------------------------------------------------------------
// Step 5 — media (document name + url are both-or-neither)
// ---------------------------------------------------------------------------

export const step5Schema = z
  .object({
    images: z
      .array(z.string().url('facility.wizard.errors.images'))
      .min(1, 'facility.wizard.errors.images')
      .max(6, 'facility.wizard.errors.images'),
    documentName: z.string().optional(),
    documentUrl: z
      .union([z.string().url('facility.wizard.errors.document'), z.literal('')])
      .optional(),
  })
  .superRefine((values, ctx) => {
    const hasName = Boolean(values.documentName?.trim());
    const hasUrl = Boolean(values.documentUrl?.trim());
    if (hasName !== hasUrl) {
      ctx.addIssue({
        code: 'custom',
        path: [hasName ? 'documentUrl' : 'documentName'],
        message: 'facility.wizard.errors.document',
      });
    }
  });
export type Step5Values = z.infer<typeof step5Schema>;
