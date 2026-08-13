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

const BASE = '/admin/players-management';
const PLAYERS_PATH = `${BASE}/players`;

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

export async function getPlayerStats(): Promise<PlayerStats> {
  const res = await apiClient.get(PLAYERS_PATH, { params: { pageSize: 1000 } });
  const all = unwrapList<PlayerDto>(res.data, ['players']).map(toPlayer);
  return {
    total: all.length,
    active: all.filter((p) => p.accountStatus === 'active' && !p.isBlocked).length,
    suspended: all.filter((p) => p.accountStatus === 'suspended' && !p.isBlocked).length,
    blocked: all.filter((p) => p.isBlocked).length,
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
  await apiClient.patch(`${PLAYERS_PATH}/${playerId}/lift-booking-suspension`, {});
}
