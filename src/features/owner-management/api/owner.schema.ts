import { z } from 'zod';

const PHONE_LOCAL_REGEX = /^9[0-9]{8}$/;
const NATIONAL_ID_REGEX = /^[0-9]{11}$/;

/** Admin-created owner — mirrors the app's signup fields (FR-ADM-OWNER-005). */
export const createOwnerSchema = z.object({
  name: z.string().trim().min(2, 'owner.errors.nameRequired'),
  email: z.string().min(1, 'owner.errors.emailRequired').email('owner.errors.emailInvalid'),
  phone: z.string().regex(PHONE_LOCAL_REGEX, 'owner.errors.phoneInvalid'),
  nationalId: z
    .string()
    .min(1, 'owner.errors.nationalIdRequired')
    .regex(NATIONAL_ID_REGEX, 'owner.errors.nationalIdInvalid'),
  intendedFacilityType: z.enum(['sports_club', 'independent_court']),
});
export type CreateOwnerValues = z.infer<typeof createOwnerSchema>;
