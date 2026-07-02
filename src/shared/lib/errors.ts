/**
 * The single place backend/network errors become a typed AppError. Kills the
 * `err?.response?.data?.message || 'fallback'` pattern duplicated across the app.
 */
export type FieldErrors = Record<string, string>;

export class AppError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    opts: { status?: number; code?: string; fieldErrors?: FieldErrors } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.status = opts.status;
    this.code = opts.code;
    this.fieldErrors = opts.fieldErrors;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  const err = error as {
    response?: { status?: number; data?: unknown };
    message?: string;
    code?: string;
  };
  const response = err?.response;
  const data = (response?.data ?? {}) as {
    message?: string;
    error?: string;
    code?: string;
    errors?: unknown;
  };

  const message =
    data.message || data.error || err?.message || 'Something went wrong. Please try again.';

  return new AppError(message, {
    status: response?.status,
    code: data.code ?? err?.code,
    fieldErrors: extractFieldErrors(data.errors),
  });
}

function extractFieldErrors(errors: unknown): FieldErrors | undefined {
  if (!errors || typeof errors !== 'object') return undefined;
  const out: FieldErrors = {};
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value;
    else if (Array.isArray(value) && typeof value[0] === 'string') out[key] = value[0];
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
