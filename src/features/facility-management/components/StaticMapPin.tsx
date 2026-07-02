import { useTranslation } from 'react-i18next';
import { MapPinIcon } from '@ui';
import styles from './StaticMapPin.module.css';

export interface StaticMapPinProps {
  lat: number;
  lng: number;
}

/**
 * A decorative "map" tile — a token-only grid canvas with a glowing centered
 * pin and an LTR-isolated coordinates caption. Used on the profile location
 * card and as the wizard's live coordinate preview (tolerates NaN while the
 * admin is still typing).
 */
export function StaticMapPin({ lat, lng }: StaticMapPinProps) {
  const { t } = useTranslation();
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <figure className={styles.map} data-testid="static-map-pin">
      <div className={styles.canvas} aria-hidden>
        <span className={styles.glow} />
        <MapPinIcon className={styles.pin} />
      </div>
      <figcaption className={styles.caption}>
        {t('facility.profile.coordinates')}
        {': '}
        <span className={styles.coords}>
          {hasCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '—'}
        </span>
      </figcaption>
    </figure>
  );
}
