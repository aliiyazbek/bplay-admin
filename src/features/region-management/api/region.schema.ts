import { z } from 'zod';

export const regionFormSchema = z
  .object({
    name: z.string().min(2, 'region.errors.nameRequired'),
    type: z.enum(['city', 'neighborhood']),
    cityId: z.string().optional(),
  })
  .refine((data) => data.type !== 'neighborhood' || (data.cityId?.length ?? 0) > 0, {
    path: ['cityId'],
    message: 'region.errors.cityRequired',
  });
export type RegionFormValues = z.infer<typeof regionFormSchema>;

export const assignAdminSchema = z.object({
  adminId: z.string().min(1, 'region.errors.adminRequired'),
});
export type AssignAdminValues = z.infer<typeof assignAdminSchema>;
