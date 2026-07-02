import { forwardRef, useState } from 'react';
import { clsx } from '../clsx';
import { Input, type InputProps } from '../Input/Input';
import { EyeIcon, EyeOffIcon } from '../icons';
import styles from './PasswordInput.module.css';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  /** Toggle aria-label while the password is hidden (click reveals it). */
  showLabel?: string;
  /** Toggle aria-label while the password is visible (click hides it). */
  hideLabel?: string;
}

/**
 * A password Input with a reveal/hide eye toggle. Wraps the base Input so it
 * inherits every field style, and forwards its ref so react-hook-form's
 * `register` binds to the underlying <input>.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, showLabel = 'Show password', hideLabel = 'Hide password', ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={styles.wrap}>
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={clsx(styles.input, className)}
        {...rest}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
});
