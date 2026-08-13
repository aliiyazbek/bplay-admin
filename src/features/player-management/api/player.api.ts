import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginatePlayers } from './player.filter';
import {
  toPlayer,
  type Player,
  type PlayerAction,
  type PlayerDto,
  type PlayerListParams,
  type PlayerListResult,
  type PlayerRating,
  type PlayerReport,
  type PlayerRoom,
  type PlayerStats,
  type PlayerSubscription,
  type ReportAction,
} from './player.types';

/**
 * The players routes are mounted at the module ROOT, not under a `/players`
 * segment: the list is `GET /admin/players-management` and one player is
 * `GET /admin/players-management/{id}`.
 *
 * This client used to append `/players` to all of them. Every request 404'd
 * except the list, which was worse — `/players` matched the `/:id` route and
 * came back 400 "must match format uuid", so the whole slice failed while
 * looking like a validation problem rather than a wrong URL.
 */
const PLAYERS_PATH = '/admin/players-management';

/** Bounded working set for client-side filtering — an explicit, visible cap. */
const WORKING_SET = 2000;
/**
 * PAGINATION: client-side, and applied exactly ONCE.
 *
 * The local pipeline still filters and sorts after the fetch, and either can drop rows —
 * so paginating on the server first would return "page 2 of N" and then filter
 * it down, leaving the count, the page boundaries and the rows disagreeing.
 *
 * The bug this replaces was paginating TWICE: page/pageSize were forwarded to
 * the server AND the returned page was sliced again locally, so page 2 asked
 * the server for rows 6-10 and then sliced that 5-element array from index 5 —
 * a blank table.
 *
 * Page params are therefore stripped from the request and a bounded working set
 * is fetched instead.
 */
export async function getPlayers(params: PlayerListParams): Promise<PlayerListResult> {
  const { page: _p, pageSize: _ps, ...serverParams } = params;
  const res = await apiClient.get(PLAYERS_PATH, { params: { ...serverParams, pageSize: WORKING_SET } });
  const all = unwrapList<PlayerDto>(res.data, ['players']).map(toPlayer);
  return filterAndPaginatePlayers(all, params);
}

export async function getPlayerById(id: string): Promise<Player> {
  const res = await apiClient.get(`${PLAYERS_PATH}/${id}`);
  return toPlayer(unwrap<PlayerDto>(res.data));
}

/** Raw KPI payload from `/stats` (server-computed, region-scoped). */
interface PlayerStatsDto {
  total?: number;
  active?: number;
  suspended?: number;
  blocked?: number;
}

/**
 * KPIs come from the server, which applies the SAME region scope as the list —
 * so the counters and the rows beneath them cannot disagree.
 *
 * This used to fetch 1000 players and count them in the browser, which was
 * wrong twice over: it silently capped at whatever the page returned, and it
 * re-derived buckets the backend already resolves by precedence.
 */
export async function getPlayerStats(): Promise<PlayerStats> {
  const res = await apiClient.get(`${PLAYERS_PATH}/stats`);
  const dto = unwrap<PlayerStatsDto>(res.data);
  return {
    total: dto.total ?? 0,
    active: dto.active ?? 0,
    suspended: dto.suspended ?? 0,
    blocked: dto.blocked ?? 0,
  };
}

export async function getPlayerSubscription(id: string): Promise<PlayerSubscription> {
  const res = await apiClient.get(`${PLAYERS_PATH}/${id}/subscription`);
  return unwrap<PlayerSubscription>(res.data);
}

export async function getPlayerRooms(id: string): Promise<PlayerRoom[]> {
  const res = await apiClient.get(`${PLAYERS_PATH}/${id}/rooms`);
  return unwrapList<PlayerRoom>(res.data, ['rooms']);
}

export async function getPlayerRatings(id: string): Promise<PlayerRating[]> {
  const res = await apiClient.get(`${PLAYERS_PATH}/${id}/ratings`);
  return unwrapList<PlayerRating>(res.data, ['ratings']);
}

export async function getPlayerReports(id: string): Promise<PlayerReport[]> {
  const res = await apiClient.get(`${PLAYERS_PATH}/${id}/reports`);
  return unwrapList<PlayerReport>(res.data, ['reports']);
}

export async function updatePlayerStatus(
  id: string,
  action: PlayerAction,
  reason?: string,
): Promise<void> {
  await apiClient.patch(`${PLAYERS_PATH}/${id}/status`, { action, reason });
}

export async function setPlayerRatingHidden(
  playerId: string,
  ratingId: string,
  hidden: boolean,
): Promise<void> {
  await apiClient.patch(`${PLAYERS_PATH}/${playerId}/ratings/${ratingId}`, { hidden });
}

export async function resolvePlayerReport(
  playerId: string,
  reportId: string,
  action: ReportAction,
  note?: string,
): Promise<void> {
  await apiClient.patch(`${PLAYERS_PATH}/${playerId}/reports/${reportId}`, { action, note });
}

export async function liftBookingSuspension(playerId: string): Promise<void> {
  await apiClient.patch(`${PLAYERS_PATH}/${playerId}/lift-suspension`, {});
}
