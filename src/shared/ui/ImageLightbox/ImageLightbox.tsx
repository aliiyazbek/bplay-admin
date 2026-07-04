import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Modal } from '../Modal/Modal';
import { IconButton } from '../IconButton/IconButton';
import { PlusIcon, MinusIcon } from '../icons';
import styles from './ImageLightbox.module.css';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const STEP = 0.5;

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  /** Image source; when absent, `fallback` is shown instead. */
  src?: string;
  alt: string;
  title?: string;
  closeLabel?: string;
  /** Rendered when there is no `src` (e.g. an initials Avatar). */
  fallback?: ReactNode;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  resetLabel?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * A large, framed image viewer built on the shared Modal (focus-trap, Esc /
 * overlay close, theme chrome). The image fills the stage by default and can be
 * zoomed (buttons, scroll wheel, double-click) and panned by dragging when
 * zoomed. A fallback node is shown when there is no image.
 */
export function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
  title,
  closeLabel,
  fallback,
  zoomInLabel = 'Zoom in',
  zoomOutLabel = 'Zoom out',
  resetLabel = 'Reset zoom',
}: ImageLightboxProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const applyScale = useCallback((next: number) => {
    const clamped = clamp(next, MIN_SCALE, MAX_SCALE);
    setScale(clamped);
    if (clamped === MIN_SCALE) setOffset({ x: 0, y: 0 });
  }, []);

  // Reset zoom/pan whenever the viewer opens or the image changes.
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, src, reset]);

  // Scroll-to-zoom. Attached non-passively so preventDefault stops page scroll.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !isOpen || !src) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyScale(scaleRef.current + (event.deltaY < 0 ? STEP : -STEP));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [isOpen, src, applyScale]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (scale <= MIN_SCALE) return;
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    setOffset({ x: start.ox + (event.clientX - start.x), y: start.oy + (event.clientY - start.y) });
  };
  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const zoomed = scale > MIN_SCALE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl" closeLabel={closeLabel}>
      <div className={styles.viewer}>
        <div
          ref={stageRef}
          className={styles.stage}
          data-zoomed={zoomed ? '' : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onDoubleClick={() => (zoomed ? reset() : applyScale(2))}
        >
          {src ? (
            <img
              className={styles.image}
              src={src}
              alt={alt}
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: dragging ? 'none' : undefined,
              }}
            />
          ) : (
            <div className={styles.fallback}>{fallback}</div>
          )}
        </div>

        {src && (
          <div className={styles.controls}>
            <IconButton
              size="sm"
              variant="secondary"
              label={zoomOutLabel}
              icon={<MinusIcon />}
              onClick={() => applyScale(scale - STEP)}
              disabled={scale <= MIN_SCALE}
            />
            <button type="button" className={styles.zoomValue} onClick={reset} aria-label={resetLabel}>
              {Math.round(scale * 100)}%
            </button>
            <IconButton
              size="sm"
              variant="secondary"
              label={zoomInLabel}
              icon={<PlusIcon />}
              onClick={() => applyScale(scale + STEP)}
              disabled={scale >= MAX_SCALE}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
