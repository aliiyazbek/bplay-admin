import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Field, Input, Button } from '@ui';
import { PATHS } from '@app/router/paths';
import { forgotSchema, type ForgotValues } from '../api/auth.schema';
import { useForgotPasswordMutation } from '../hooks/useAuthMutations';
import styles from './authForm.module.css';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const mutation = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Field
        label={t('auth.email')}
        htmlFor="email"
        error={errors.email ? t(errors.email.message ?? '') : undefined}
      >
        <Input id="email" type="email" autoComplete="email" placeholder="admin@bplay.app" {...register('email')} />
      </Field>
      <Button type="submit" fullWidth isLoading={mutation.isPending}>
        {t('auth.sendReset')}
      </Button>
      <Link className={styles.link} to={PATHS.login}>
        {t('auth.backToLogin')}
      </Link>
    </form>
  );
}
