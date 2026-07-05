import { mockDelay } from '@shared/lib/mock';
import type { GeoPoint } from '@shared/lib/geo';
import { filterAndPaginatePlayers } from './player.filter';
import type {
  BillingPeriod,
  BookingStatus,
  Gender,
  MatchStyle,
  MembershipStatus,
  Player,
  PlayerAccountStatus,
  PlayerAccountType,
  PlayerAction,
  PlayerBooking,
  PlayerInvoice,
  PlayerListParams,
  PlayerListResult,
  PlayerMembership,
  PlayerRating,
  PlayerReport,
  PlayerRoom,
  PlayerSport,
  PlayerStats,
  PlayerSubscription,
  RatingTarget,
  ReportAction,
  RoomRole,
  RoomStatus,
  SportKind,
} from './player.types';

// --- time helpers (mock runs at app runtime, so Date is available) -----------
const iso = (ms: number): string => new Date(ms).toISOString();
const daysAgo = (n: number): string => iso(Date.now() - n * 86_400_000);
const daysAhead = (n: number): string => iso(Date.now() + n * 86_400_000);

// --- reference pools ---------------------------------------------------------
const FACILITIES = [
  'Green Valley Club',
  'Padel Point',
  'Ace Tennis Center',
  'Downtown Arena',
  'Riverside Courts',
  'Champions Hub',
];
const COURTS = ['Court A', 'Center Court', 'Pitch 2', 'Court 1', 'Indoor B', 'Court 3'];
const CLUBS = ['Green Valley Club', 'Champions Hub', 'Elite Sports Club'];
const CLUB_PLANS = [
  { name: 'Monthly Basic', price: 300_000 },
  { name: 'Quarterly Pro', price: 750_000 },
  { name: 'Annual Elite', price: 2_400_000 },
];
const BPLAY_PLANS = [
  { name: 'Bplay Plus', monthly: 120_000, annual: 1_200_000 },
  { name: 'Bplay Pro', monthly: 250_000, annual: 2_500_000 },
];
const SPORT_ROT: SportKind[] = ['football', 'padel', 'tennis', 'basketball', 'volleyball', 'swimming'];
const RATING_COMMENTS = [
  'Great courts, very well maintained.',
  'Friendly staff and spotless facilities.',
  'Booking was smooth — I will definitely return.',
  'Court lighting could be improved for night games.',
  '',
  'Average experience overall, nothing special.',
  'Excellent match, a great and fair opponent.',
];
const REPORT_REASONS = [
  'Abusive language in room chat',
  'No-show without prior notice',
  'Unsportsmanlike conduct during the match',
  'Spam / self-promotion in the community',
];

/** Approximate governorate-center coordinates for the mock player locations. */
const CITY_COORDS: Record<string, GeoPoint> = {
  Damascus: { lat: 33.5138, lng: 36.2765 },
  Aleppo: { lat: 36.2021, lng: 37.1343 },
  Homs: { lat: 34.7324, lng: 36.7137 },
  Latakia: { lat: 35.5307, lng: 35.7822 },
  Tartus: { lat: 34.889, lng: 35.8866 },
  Hama: { lat: 35.1318, lng: 36.7578 },
  Daraa: { lat: 32.6189, lng: 36.1021 },
  Idlib: { lat: 35.9306, lng: 36.6339 },
};

/** A deterministic point near the player's city centre (a small per-index offset). */
function cityLocation(city: string, i: number): GeoPoint | undefined {
  const base = CITY_COORDS[city];
  if (!base) return undefined;
  return {
    lat: Number((base.lat + ((i % 5) - 2) * 0.004).toFixed(5)),
    lng: Number((base.lng + (((i + 2) % 5) - 2) * 0.004).toFixed(5)),
  };
}

const sp = (sport: SportKind, skillLevel: PlayerSport['skillLevel']): PlayerSport => ({ sport, skillLevel });

interface Seed {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  dob: string;
  city: string;
  bio?: string;
  sports: PlayerSport[];
  emailVerified: boolean;
  twoFactor: boolean;
  accountStatus: PlayerAccountStatus;
  isBlocked: boolean;
  accountType: PlayerAccountType;
  noShow: number;
  photo: number;
  statusReason?: string;
  blockedReason?: string;
}

const SEED: Seed[] = [
  { name: 'Yara Ibrahim', email: 'yara.ibrahim@bplay.app', phone: '933210110', gender: 'female', dob: '1996-03-14', city: 'Damascus', bio: 'Padel and football on weekends.', sports: [sp('football', 'intermediate'), sp('padel', 'advanced')], emailVerified: true, twoFactor: true, accountStatus: 'active', isBlocked: false, accountType: 'paid', noShow: 0, photo: 20 },
  { name: 'Kareem Saleh', email: 'kareem.saleh@bplay.app', phone: '944320221', gender: 'male', dob: '1993-07-02', city: 'Aleppo', sports: [sp('tennis', 'intermediate')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 0, photo: 12 },
  { name: 'Lana Haddad', email: 'lana.haddad@bplay.app', phone: '955430332', gender: 'female', dob: '1998-11-21', city: 'Damascus', bio: 'Competitive padel player.', sports: [sp('padel', 'pro'), sp('basketball', 'beginner')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'paid', noShow: 1, photo: 32 },
  { name: 'Omar Nasr', email: 'omar.nasr@bplay.app', phone: '966540443', gender: 'male', dob: '1991-01-09', city: 'Homs', sports: [sp('football', 'advanced')], emailVerified: true, twoFactor: false, accountStatus: 'suspended', isBlocked: false, accountType: 'free', noShow: 4, photo: 51, statusReason: 'Multiple no-show violations reported by facilities.' },
  { name: 'Sara Deeb', email: 'sara.deeb@bplay.app', phone: '977650554', gender: 'female', dob: '1995-05-30', city: 'Latakia', bio: 'Swimming and tennis.', sports: [sp('swimming', 'advanced'), sp('tennis', 'intermediate')], emailVerified: true, twoFactor: true, accountStatus: 'active', isBlocked: false, accountType: 'paid', noShow: 0, photo: 47 },
  { name: 'Hadi Mansour', email: 'hadi.mansour@bplay.app', phone: '988760665', gender: 'male', dob: '1994-09-17', city: 'Tartus', sports: [sp('football', 'intermediate'), sp('volleyball', 'beginner')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 2, photo: 15 },
  { name: 'Nour Aziz', email: 'nour.aziz@bplay.app', phone: '933870776', gender: 'female', dob: '1997-02-05', city: 'Damascus', bio: 'Padel enthusiast.', sports: [sp('padel', 'intermediate')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'paid', noShow: 0, photo: 5 },
  { name: 'Bilal Khoury', email: 'bilal.khoury@bplay.app', phone: '944980887', gender: 'male', dob: '1990-12-12', city: 'Aleppo', sports: [sp('basketball', 'advanced')], emailVerified: true, twoFactor: true, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 0, photo: 13 },
  { name: 'Maya Suleiman', email: 'maya.suleiman@bplay.app', phone: '955190998', gender: 'female', dob: '1992-08-24', city: 'Hama', sports: [sp('tennis', 'intermediate')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: true, accountType: 'free', noShow: 1, photo: 45, blockedReason: 'Harassment of other players; permanent ban after review.' },
  { name: 'Ziad Fares', email: 'ziad.fares@bplay.app', phone: '966210109', gender: 'male', dob: '1989-06-19', city: 'Damascus', sports: [sp('football', 'advanced'), sp('tennis', 'beginner')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'paid', noShow: 5, photo: 33 },
  { name: 'Rima Saab', email: 'rima.saab@bplay.app', phone: '977320210', gender: 'female', dob: '1999-04-27', city: 'Daraa', bio: 'New to Bplay.', sports: [sp('volleyball', 'beginner')], emailVerified: false, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 0, photo: 9 },
  { name: 'Tarek Wehbe', email: 'tarek.wehbe@bplay.app', phone: '988430321', gender: 'male', dob: '1993-10-08', city: 'Idlib', sports: [sp('football', 'intermediate')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 1, photo: 60 },
  { name: 'Dina Rahal', email: 'dina.rahal@bplay.app', phone: '933540432', gender: 'female', dob: '1996-12-01', city: 'Latakia', bio: 'Competitive swimmer.', sports: [sp('swimming', 'pro')], emailVerified: true, twoFactor: true, accountStatus: 'active', isBlocked: false, accountType: 'paid', noShow: 0, photo: 44 },
  { name: 'Samer Halabi', email: 'samer.halabi@bplay.app', phone: '944650543', gender: 'male', dob: '1988-03-03', city: 'Homs', sports: [sp('padel', 'advanced')], emailVerified: true, twoFactor: false, accountStatus: 'suspended', isBlocked: false, accountType: 'paid', noShow: 0, photo: 52, statusReason: 'Account paused pending identity re-verification.' },
  { name: 'Lina Kassem', email: 'lina.kassem@bplay.app', phone: '955760654', gender: 'female', dob: '1994-07-15', city: 'Tartus', sports: [sp('tennis', 'intermediate'), sp('padel', 'beginner')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 0, photo: 25 },
  { name: 'Fadi Barakat', email: 'fadi.barakat.p@bplay.app', phone: '966870765', gender: 'male', dob: '1991-11-11', city: 'Aleppo', sports: [sp('basketball', 'intermediate'), sp('football', 'intermediate')], emailVerified: true, twoFactor: false, accountStatus: 'active', isBlocked: false, accountType: 'free', noShow: 3, photo: 11 },
];

// --- per-player related-collection generators (deterministic from index) -----
function genBookings(id: string, seed: Seed, i: number): PlayerBooking[] {
  const count = 3 + (i % 4);
  const list: PlayerBooking[] = [];
  for (let j = 0; j < count; j += 1) {
    let status: BookingStatus;
    let date: string;
    if (j < Math.min(seed.noShow, 2)) {
      status = 'no_show';
      date = daysAgo(20 + j * 7);
    } else if (j >= count - 1) {
      status = 'upcoming';
      date = daysAhead(3 + j);
    } else if ((i + j) % 5 === 0) {
      status = 'cancelled';
      date = daysAgo(10 + j * 3);
    } else {
      status = 'completed';
      date = daysAgo(5 + j * 6);
    }
    const hour = 16 + (j % 5);
    list.push({
      id: `${id}-b${j + 1}`,
      facilityName: FACILITIES[(i + j) % FACILITIES.length],
      courtName: COURTS[(i + j) % COURTS.length],
      sport: seed.sports[j % seed.sports.length].sport,
      date,
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      status,
      amountSyp: 40_000 + ((i + j) % 4) * 15_000,
      paymentMethod: (i + j) % 2 === 0 ? 'cash' : 'transfer',
    });
  }
  return list;
}

function genMemberships(id: string, i: number): PlayerMembership[] {
  const n = i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 0;
  const list: PlayerMembership[] = [];
  for (let j = 0; j < n; j += 1) {
    const plan = CLUB_PLANS[(i + j) % CLUB_PLANS.length];
    const status: MembershipStatus = j === 0 ? 'active' : 'expired';
    list.push({
      id: `${id}-m${j + 1}`,
      clubName: CLUBS[(i + j) % CLUBS.length],
      planName: plan.name,
      priceSyp: plan.price,
      status,
      startDate: daysAgo(150 - j * 30),
      endDate: status === 'active' ? daysAhead(60) : daysAgo(10),
      paymentMethod: (i + j) % 2 === 0 ? 'cash' : 'transfer',
      autoRenew: status === 'active',
    });
  }
  return list;
}

function genSubscription(id: string, seed: Seed, i: number): PlayerSubscription {
  if (seed.accountType !== 'paid') return { accountType: 'free', invoices: [] };
  const plan = BPLAY_PLANS[i % BPLAY_PLANS.length];
  const annual = i % 2 === 0;
  const period: BillingPeriod = annual ? 'annual' : 'monthly';
  const price = annual ? plan.annual : plan.monthly;
  const cycles = annual ? 1 : 3;
  const invoices: PlayerInvoice[] = [];
  for (let k = 0; k < cycles; k += 1) {
    invoices.push({
      id: `${id}-inv${k + 1}`,
      date: daysAgo(30 * (cycles - k)),
      amountSyp: price,
      planName: plan.name,
      status: 'paid',
    });
  }
  return {
    accountType: 'paid',
    planName: plan.name,
    status: 'active',
    billingPeriod: period,
    startDate: daysAgo(annual ? 200 : 90),
    renewalDate: annual ? daysAhead(165) : daysAhead(15),
    autoRenew: i % 3 !== 0,
    priceSyp: price,
    invoices,
  };
}

function genRooms(id: string, i: number): PlayerRoom[] {
  const count = 2 + (i % 3);
  const statuses: RoomStatus[] = ['ended', 'open', 'full', 'cancelled'];
  const styles: MatchStyle[] = ['friendly', 'competitive', 'training'];
  const list: PlayerRoom[] = [];
  for (let j = 0; j < count; j += 1) {
    const status = statuses[(i + j) % statuses.length];
    const required = 4 + (j % 3) * 2;
    const joined =
      status === 'full'
        ? required
        : status === 'cancelled'
          ? Math.max(1, required - 2)
          : Math.min(required, 2 + j);
    const role: RoomRole = j % 2 === 0 ? 'leader' : 'member';
    const upcoming = status === 'open' || status === 'full';
    list.push({
      id: `${id}-r${j + 1}`,
      sport: SPORT_ROT[(i + j) % SPORT_ROT.length],
      facilityName: FACILITIES[(i + j + 1) % FACILITIES.length],
      courtName: COURTS[(i + j) % COURTS.length],
      date: upcoming ? daysAhead(2 + j) : daysAgo(6 + j * 4),
      startTime: `${String(18 + (j % 3)).padStart(2, '0')}:00`,
      role,
      type: j % 3 === 0 ? 'private' : 'public',
      matchStyle: styles[(i + j) % styles.length],
      joinedCount: joined,
      requiredCount: required,
      status,
    });
  }
  return list;
}

function genRatings(id: string, i: number): PlayerRating[] {
  const count = 2 + (i % 4);
  const targets: RatingTarget[] = ['facility', 'club', 'player'];
  const targetNames: Record<RatingTarget, string[]> = {
    facility: FACILITIES,
    club: CLUBS,
    player: ['Kareem S.', 'Omar N.', 'Nour A.', 'Bilal K.', 'Dina R.'],
  };
  const list: PlayerRating[] = [];
  for (let j = 0; j < count; j += 1) {
    const target = targets[(i + j) % targets.length];
    const pool = targetNames[target];
    const comment = RATING_COMMENTS[(i + j) % RATING_COMMENTS.length] || undefined;
    list.push({
      id: `${id}-rt${j + 1}`,
      target,
      targetName: pool[(i + j) % pool.length],
      stars: 3 + ((i + j) % 3),
      comment,
      date: daysAgo(8 + j * 10),
      // Demo an admin-moderated (hidden) review on one player.
      hidden: i === 2 && j === 0,
    });
  }
  return list;
}

function genReports(id: string, i: number): PlayerReport[] {
  const list: PlayerReport[] = [];
  const counterparty = (offset: number): string => SEED[(i + offset) % SEED.length].name;
  if (i === 2 || i === 5 || i === 9) {
    list.push({
      id: `${id}-rp1`,
      direction: 'against',
      counterpartyName: counterparty(1),
      reason: REPORT_REASONS[i % REPORT_REASONS.length],
      details: 'Reported after a competitive match; awaiting super-admin review.',
      context: 'room',
      status: i === 9 ? 'reviewing' : 'open',
      date: daysAgo(3 + (i % 4)),
    });
  }
  if (i === 2 || i === 7) {
    list.push({
      id: `${id}-rp2`,
      direction: 'filed',
      counterpartyName: counterparty(3),
      reason: REPORT_REASONS[(i + 1) % REPORT_REASONS.length],
      details: 'Filed by the player against an opponent.',
      context: 'chat',
      status: i === 2 ? 'resolved' : 'dismissed',
      date: daysAgo(20 + i),
      resolutionNote: i === 2 ? 'Warning issued to the reported player.' : 'Insufficient evidence.',
    });
  }
  return list;
}

// --- in-memory mutable stores (mutations persist for the session) ------------
const bookingsBy: Record<string, PlayerBooking[]> = {};
const membershipsBy: Record<string, PlayerMembership[]> = {};
const subscriptionBy: Record<string, PlayerSubscription> = {};
const roomsBy: Record<string, PlayerRoom[]> = {};
const ratingsBy: Record<string, PlayerRating[]> = {};
const reportsBy: Record<string, PlayerReport[]> = {};

function openReportCount(reports: PlayerReport[]): number {
  return reports.filter(
    (report) => report.direction === 'against' && (report.status === 'open' || report.status === 'reviewing'),
  ).length;
}

const db: Player[] = SEED.map((seed, i) => {
  const id = String(500 + i);
  const bookings = (bookingsBy[id] = genBookings(id, seed, i));
  const memberships = (membershipsBy[id] = genMemberships(id, i));
  const subscription = (subscriptionBy[id] = genSubscription(id, seed, i));
  const rooms = (roomsBy[id] = genRooms(id, i));
  const ratings = (ratingsBy[id] = genRatings(id, i));
  const reports = (reportsBy[id] = genReports(id, i));

  const totalSpent =
    bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.amountSyp, 0) +
    memberships.filter((m) => m.status !== 'cancelled').reduce((s, m) => s + m.priceSyp, 0) +
    subscription.invoices.reduce((s, inv) => s + inv.amountSyp, 0);

  return {
    id,
    name: seed.name,
    email: seed.email,
    phone: `963${seed.phone}`,
    gender: seed.gender,
    dateOfBirth: seed.dob,
    photoUrl: `https://i.pravatar.cc/512?img=${seed.photo}`,
    city: seed.city,
    bio: seed.bio,
    sports: seed.sports,
    accountStatus: seed.accountStatus,
    statusReason: seed.statusReason,
    isBlocked: seed.isBlocked,
    blockedReason: seed.blockedReason,
    emailVerified: seed.emailVerified,
    twoFactorEnabled: seed.twoFactor,
    accountType: subscription.accountType,
    currentPlan: subscription.planName,
    noShowViolations: seed.noShow,
    bookingSuspendedUntil: seed.noShow >= 5 ? daysAhead(10) : undefined,
    overallRating: Math.round((3.7 + (i % 12) * 0.1) * 10) / 10,
    bookingsCount: bookings.length,
    roomsCount: rooms.length,
    ratingsGivenCount: ratings.length,
    totalSpentSyp: totalSpent,
    openReportsCount: openReportCount(reports),
    // Rima (index 10) hasn't shared her location — exercises the empty state.
    location: i === 10 ? undefined : cityLocation(seed.city, i),
    createdAt: daysAgo(i * 11 + 3),
  };
});

function applyAction(player: Player, action: PlayerAction, reason?: string): void {
  switch (action) {
    case 'suspend':
      player.accountStatus = 'suspended';
      player.statusReason = reason;
      break;
    case 'activate':
      player.accountStatus = 'active';
      player.statusReason = undefined;
      break;
    case 'block':
      player.isBlocked = true;
      player.blockedReason = reason;
      break;
    case 'unblock':
      player.isBlocked = false;
      player.blockedReason = undefined;
      break;
  }
}

// --- query functions ---------------------------------------------------------
export async function getPlayers(params: PlayerListParams): Promise<PlayerListResult> {
  await mockDelay();
  return filterAndPaginatePlayers(db, params);
}

export async function getPlayerById(id: string): Promise<Player> {
  await mockDelay();
  const player = db.find((item) => item.id === id);
  if (!player) throw new Error('Player not found');
  return { ...player, sports: player.sports.map((entry) => ({ ...entry })) };
}

export async function getPlayerStats(): Promise<PlayerStats> {
  await mockDelay(200);
  return {
    total: db.length,
    active: db.filter((p) => p.accountStatus === 'active' && !p.isBlocked).length,
    suspended: db.filter((p) => p.accountStatus === 'suspended' && !p.isBlocked).length,
    blocked: db.filter((p) => p.isBlocked).length,
  };
}

export async function getPlayerBookings(id: string): Promise<PlayerBooking[]> {
  await mockDelay(300);
  return (bookingsBy[id] ?? []).map((booking) => ({ ...booking }));
}

export async function getPlayerMemberships(id: string): Promise<PlayerMembership[]> {
  await mockDelay(300);
  return (membershipsBy[id] ?? []).map((membership) => ({ ...membership }));
}

export async function getPlayerSubscription(id: string): Promise<PlayerSubscription> {
  await mockDelay(200);
  const sub = subscriptionBy[id] ?? { accountType: 'free', invoices: [] };
  return { ...sub, invoices: sub.invoices.map((inv) => ({ ...inv })) };
}

export async function getPlayerRooms(id: string): Promise<PlayerRoom[]> {
  await mockDelay(300);
  return (roomsBy[id] ?? []).map((room) => ({ ...room }));
}

export async function getPlayerRatings(id: string): Promise<PlayerRating[]> {
  await mockDelay(300);
  return (ratingsBy[id] ?? []).map((rating) => ({ ...rating }));
}

export async function getPlayerReports(id: string): Promise<PlayerReport[]> {
  await mockDelay(300);
  return (reportsBy[id] ?? []).map((report) => ({ ...report }));
}

// --- mutations ---------------------------------------------------------------
export async function updatePlayerStatus(
  id: string,
  action: PlayerAction,
  reason?: string,
): Promise<void> {
  await mockDelay();
  const player = db.find((item) => item.id === id);
  if (!player) return;
  applyAction(player, action, reason);
}

/** Hide / un-hide an abusive review the player left (content moderation). */
export async function setPlayerRatingHidden(
  playerId: string,
  ratingId: string,
  hidden: boolean,
): Promise<void> {
  await mockDelay();
  const rating = (ratingsBy[playerId] ?? []).find((item) => item.id === ratingId);
  if (rating) rating.hidden = hidden;
}

/** Resolve or dismiss a report tied to the player, recomputing the open count. */
export async function resolvePlayerReport(
  playerId: string,
  reportId: string,
  action: ReportAction,
  note?: string,
): Promise<void> {
  await mockDelay();
  const report = (reportsBy[playerId] ?? []).find((item) => item.id === reportId);
  if (!report) return;
  report.status = action === 'resolve' ? 'resolved' : 'dismissed';
  report.resolutionNote = note;
  const player = db.find((item) => item.id === playerId);
  if (player) player.openReportsCount = openReportCount(reportsBy[playerId] ?? []);
}

/** Lift the automatic no-show booking suspension and clear the violation count. */
export async function liftBookingSuspension(playerId: string): Promise<void> {
  await mockDelay();
  const player = db.find((item) => item.id === playerId);
  if (!player) return;
  player.bookingSuspendedUntil = undefined;
  player.noShowViolations = 0;
}
