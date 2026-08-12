import { z } from 'zod';

const PHONE_LOCAL_REGEX = /^9[0-9]{8}$/;
const NATIONAL_ID_REGEX = /^[0-9]{11}$/;

/**
 * Admin-created owner (FR-ADM-OWNER-005). The fields mirror
 * `createOwnerByAdminSchema` on the backend exactly — it rejects unknown keys,
 * so anything not listed there would fail the request rather than be ignored.
 */
export const createOwnerSchema = z.object({
  name: z.string().trim().min(2, 'owner.errors.nameRequired'),
  email: z.string().min(1, 'owner.errors.emailRequired').email('owner.errors.emailInvalid'),
  phone: z.string().regex(PHONE_LOCAL_REGEX, 'owner.errors.phoneInvalid'),
  nationalId: z
    .string()
    .min(1, 'owner.errors.nationalIdRequired')
    .regex(NATIONAL_ID_REGEX, 'owner.errors.nationalIdInvalid'),
  address: z.string().trim().max(500, 'owner.errors.addressTooLong').optional(),
});
export type CreateOwnerValues = z.infer<typeof createOwnerSchema>;
