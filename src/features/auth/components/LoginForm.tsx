import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Field, Input, PasswordInput, Button } from '@ui';
import { loginSchema, type LoginValues } from '../api/auth.schema';
import { useLoginMutation } from '../hooks/useAuthMutations';
import styles from './authForm.module.css';

export function LoginForm() {
  const { t } = useTranslation();
  const mutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
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
      <Field
        label={t('auth.password')}
        htmlFor="password"
        error={errors.password ? t(errors.password.message ?? '') : undefined}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          showLabel={t('auth.showPassword')}
          hideLabel={t('auth.hidePassword')}
          {...register('password')}
        />
      </Field>
      <Button type="submit" fullWidth isLoading={mutation.isPending}>
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
