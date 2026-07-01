import { z } from 'zod';

export const inviteAdminSchema = z.object({
  name: z.string().min(2, 'admin.errors.nameRequired'),
  email: z.string().min(1, 'admin.errors.emailRequired').email('admin.errors.emailInvalid'),
  password: z.string().min(8, 'admin.errors.passwordShort'),
});
export type InviteAdminValues = z.infer<typeof inviteAdminSchema>;

export const editAdminSchema = z.object({
  name: z.string().min(2, 'admin.errors.nameRequired'),
  email: z.string().min(1, 'admin.errors.emailRequired').email('admin.errors.emailInvalid'),
});
export type EditAdminValues = z.infer<typeof editAdminSchema>;
