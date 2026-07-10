import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  IconButton,
  RatingStars,
  Spinner,
  EmptyState,
  ErrorState,
  EyeIcon,
  EyeOffIcon,
  InboxIcon,
  clsx,
} from '@ui';
import { PATHS } from '@app/router/paths';
import { type PlayerRating } from '../api/player.types';
import { usePlayerRatings } from '../hooks/usePlayerRelated';
import { useRatingModeration } from '../hooks/usePlayerModeration';
import styles from './playerCards.module.css';

interface Props {
  playerId: string;
}

/** Ratings + written comments the player left, with hide/un-hide moderation. */
export function PlayerRatingsCard({ playerId }: Props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = usePlayerRatings(playerId);
  const moderation = useRatingModeration(playerId);
  const locale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const ratings = data ?? [];

  const toggle = (rating: PlayerRating) =>
    moderation.mutate({ ratingId: rating.id, hidden: !rating.hidden });

  return (
    <Card padding="lg" className={styles.card} data-testid="player-ratings-card">
      <div className={styles.head}>
        <h2 className={styles.title}>{t('player.tabs.ratings')}</h2>
      </div>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState
          message={t('common.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void refetch()}
        />
      ) : ratings.length === 0 ? (
        <EmptyState icon={<InboxIcon />} title={t('player.ratings.empty')} />
      ) : (
        <div className={styles.list}>
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className={clsx(styles.ratingRow, rating.hidden && styles.ratingHidden)}
            >
              <div className={styles.ratingMain}>
                <div className={styles.ratingHead}>
                  {rating.targetId ? (
                    <button
                      type="button"
                      className={styles.linkTarget}
                      onClick={() => navigate(`${PATHS.facilityManagement}/${rating.targetId}`)}
                    >
                      {rating.targetName}
                    </button>
                  ) : (
                    <span className={styles.ratingTarget}>{rating.targetName}</span>
                  )}
                  <Badge variant="neutral" size="sm">
                    {t(`player.ratingTarget.${rating.target}`)}
                  </Badge>
                  <RatingStars value={rating.stars} size="sm" />
                  {rating.hidden && (
                    <Badge variant="danger" size="sm">
                      {t('player.ratings.hiddenTag')}
                    </Badge>
                  )}
                </div>
                {rating.comment && <p className={styles.comment}>“{rating.comment}”</p>}
                <span className={styles.meta}>
                  {new Date(rating.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.actionsCell}>
                <IconButton
                  size="sm"
                  variant={rating.hidden ? 'ghost' : 'danger'}
                  label={t(rating.hidden ? 'player.ratings.show' : 'player.ratings.hide')}
                  icon={rating.hidden ? <EyeIcon /> : <EyeOffIcon />}
                  onClick={() => toggle(rating)}
                  data-testid={`player-rating-toggle-${rating.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
