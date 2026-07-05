import { useId, useRef, useState, type DragEvent } from 'react';
import { clsx } from '../clsx';
import {
  UploadCloudIcon,
  XIcon,
  DocumentIcon,
  ArrowStartIcon,
  ChevronEndIcon,
} from '../icons';
import styles from './FileUpload.module.css';

/** One uploaded asset. `url` is an object URL in mock mode, a remote URL post-backend. */
export interface UploadedFile {
  url: string;
  name: string;
}

export interface FileUploadProps {
  /** Controlled list of files. */
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** 'image' → thumbnail grid with reorder + cover badge; 'document' → named file list. */
  variant?: 'image' | 'document';
  /** Accept attribute for the native picker (e.g. 'image/*', '.pdf,image/*'). */
  accept?: string;
  /** Hard cap on the number of files; the dropzone hides once reached. */
  maxFiles?: number;
  disabled?: boolean;
  /** Props-driven strings — the kit never calls useTranslation. */
  dropLabel: string;
  browseLabel: string;
  hint?: string;
  removeLabel: string;
  coverLabel?: string;
  moveEarlierLabel?: string;
  moveLaterLabel?: string;
  maxReachedLabel?: string;
  testId?: string;
}

/**
 * A free, mock-first file uploader. Drag-and-drop or browse to add files; every
 * file becomes an { url, name } via URL.createObjectURL — so going live only
 * swaps the object-URL step for a real upload call. Images render as a reorderable
 * thumbnail grid (first = cover); documents render as a named list. Fully keyboard
 * accessible and RTL-safe (logical properties + start/end move controls).
 */
export function FileUpload({
  value,
  onChange,
  variant = 'image',
  accept = variant === 'image' ? 'image/*' : undefined,
  maxFiles,
  disabled = false,
  dropLabel,
  browseLabel,
  hint,
  removeLabel,
  coverLabel,
  moveEarlierLabel,
  moveLaterLabel,
  maxReachedLabel,
  testId,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  const atMax = typeof maxFiles === 'number' && value.length >= maxFiles;
  const remaining = typeof maxFiles === 'number' ? maxFiles - value.length : Infinity;

  const addFiles = (files: FileList | null) => {
    if (!files || disabled) return;
    const incoming = Array.from(files).slice(0, remaining === Infinity ? undefined : remaining);
    if (incoming.length === 0) return;
    const mapped = incoming.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    onChange([...value, ...mapped]);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled || atMax) return;
    addFiles(event.dataTransfer.files);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !atMax) setDragging(true);
  };

  const remove = (index: number) => {
    // Free the object URL we minted for this file (seeded remote URLs are left alone).
    const removed = value[index];
    if (removed && removed.url.startsWith('blob:')) URL.revokeObjectURL(removed.url);
    onChange(value.filter((_, i) => i !== index));
  };

  const swap = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={styles.wrap} data-testid={testId}>
      {!atMax && (
        <div
          className={clsx(styles.dropzone, dragging && styles.dragging, disabled && styles.disabled)}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          onClick={disabled ? undefined : openPicker}
          onKeyDown={(event) => {
            if (disabled) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setDragging(false)}
          data-testid={testId ? `${testId}-dropzone` : undefined}
        >
          <span className={styles.dropIcon} aria-hidden>
            <UploadCloudIcon />
          </span>
          <span className={styles.dropTitle}>{dropLabel}</span>
          <span className={styles.browse}>{browseLabel}</span>
          {hint && <span className={styles.hint}>{hint}</span>}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className={styles.input}
            accept={accept}
            multiple
            disabled={disabled}
            onChange={(event) => {
              addFiles(event.target.files);
              // Reset so re-selecting the same file re-fires change.
              event.target.value = '';
            }}
            tabIndex={-1}
          />
        </div>
      )}

      {atMax && maxReachedLabel && <p className={styles.maxNote}>{maxReachedLabel}</p>}

      {value.length > 0 &&
        (variant === 'image' ? (
          <ul className={styles.grid}>
            {value.map((file, index) => (
              <li key={file.url} className={styles.thumb}>
                <img className={styles.thumbImg} src={file.url} alt={file.name} loading="lazy" />
                {index === 0 && coverLabel && <span className={styles.cover}>{coverLabel}</span>}
                <div className={styles.thumbBar}>
                  <button
                    type="button"
                    className={styles.thumbBtn}
                    onClick={() => swap(index, index - 1)}
                    disabled={index === 0}
                    aria-label={moveEarlierLabel}
                    title={moveEarlierLabel}
                  >
                    <ArrowStartIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.thumbBtn}
                    onClick={() => swap(index, index + 1)}
                    disabled={index === value.length - 1}
                    aria-label={moveLaterLabel}
                    title={moveLaterLabel}
                  >
                    <ChevronEndIcon />
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.thumbBtn, styles.thumbRemove)}
                    onClick={() => remove(index)}
                    aria-label={removeLabel}
                    title={removeLabel}
                  >
                    <XIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={styles.docList}>
            {value.map((file, index) => (
              <li key={file.url} className={styles.docRow}>
                <span className={styles.docIcon} aria-hidden>
                  <DocumentIcon />
                </span>
                <span className={styles.docName} title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  className={styles.docRemove}
                  onClick={() => remove(index)}
                  aria-label={removeLabel}
                  title={removeLabel}
                >
                  <XIcon />
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
