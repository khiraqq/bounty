// FILE: utils/riskScore.js
// Pure scoring algorithm — no DB calls, takes pre-fetched data objects.
// Returns { score: Number, breakdown: [{ factor, weight, triggered }] }

/**
 * calculateRiskScore
 *
 * @param {Object} params
 * @param {Object}   params.user            - User document (plain object)
 * @param {Object[]} params.orders          - All orders for this user
 * @param {Object[]} params.allUsers        - Array of all users (for IP/wallet comparison)
 * @param {Object[]} params.bannedUsers     - Array of banned/suspended users
 * @param {Object[]} params.disputes        - Dispute documents for this user
 * @returns {{ score: number, breakdown: Array }}
 */
export function calculateRiskScore({ user, orders = [], allUsers = [], bannedUsers = [], disputes = [] }) {
  const factors = [];
  let score = 0;

  const add = (factor, weight, triggered, note = '') => {
    factors.push({ factor, weight, triggered, note });
    if (triggered) score += weight;
  };

  const now = Date.now();
  const DAY = 86_400_000;
  const WEEK = 7 * DAY;

  // ── Network / Identity ────────────────────────────────────────────────────

  // Shared IP with other accounts (+2)
  const otherUsersWithSameIp = allUsers.filter(
    u => String(u._id) !== String(user._id) &&
         u.registrationIp &&
         u.registrationIp === user.registrationIp
  );
  add(
    'Shared registration IP',
    2,
    otherUsersWithSameIp.length > 0,
    otherUsersWithSameIp.length > 0
      ? `${otherUsersWithSameIp.length} other account(s) share IP ${user.registrationIp}`
      : ''
  );

  // Shared wallet address (+4)
  const userWallets = user.walletAddresses || [];
  const sharedWallet = userWallets.length > 0 && allUsers.some(
    u => String(u._id) !== String(user._id) &&
         (u.walletAddresses || []).some(w => userWallets.includes(w))
  );
  add('Shared wallet address', 4, sharedWallet);

  // Similar patterns to banned accounts (+2) — same IP as a banned account
  const matchesBanned = bannedUsers.some(
    b => String(b._id) !== String(user._id) &&
         b.registrationIp &&
         b.registrationIp === user.registrationIp
  );
  add('IP matches banned account', 2, matchesBanned);

  // ── Activity Spikes ───────────────────────────────────────────────────────

  // New account < 1 week (+3)
  const accountAge = now - new Date(user.createdAt).getTime();
  add('Account younger than 1 week', 3, accountAge < WEEK);

  // More than 5 orders in last 24 h (+2)
  const ordersLast24h = orders.filter(
    o => now - new Date(o.createdAt).getTime() < DAY
  );
  add('>5 orders in 24 hours', 2, ordersLast24h.length > 5, `${ordersLast24h.length} orders`);

  // Any single order > $500 (+3)
  const hasLargeOrder = orders.some(o => Number(o.amount || o.price || 0) > 500);
  add('Order > $500', 3, hasLargeOrder);

  // ── Behavior ──────────────────────────────────────────────────────────────

  // Multiple wallet addresses submitted (+2)
  add('Multiple wallet addresses submitted', 2, (user.walletAddresses || []).length >= 2);

  // 2+ disputes in 7 days (+2)
  const recentDisputes = disputes.filter(
    d => now - new Date(d.createdAt).getTime() < WEEK
  );
  add('2+ disputes in 7 days', 2, recentDisputes.length >= 2, `${recentDisputes.length} dispute(s)`);

  // Logins from 2+ countries in 24 h (+1)
  const recentLogins = (user.loginHistory || []).filter(
    l => now - new Date(l.createdAt).getTime() < DAY
  );
  const countriesLast24h = new Set(recentLogins.map(l => l.country).filter(Boolean));
  add('Logins from 2+ countries in 24h', 1, countriesLast24h.size >= 2, `${countriesLast24h.size} country/countries`);

  // ── Manual ────────────────────────────────────────────────────────────────

  // Admin manual flag (+5)
  add('Admin manual flag', 5, !!user.manualFlagged);

  return { score, breakdown: factors };
}

/**
 * riskLabel — classify a numeric score into a severity label
 */
export function riskLabel(score) {
  if (score >= 10) return 'Critical';
  if (score >= 6)  return 'High';
  if (score >= 3)  return 'Medium';
  return 'Low';
}

/**
 * riskColor — Tailwind-safe inline color for a score label
 */
export function riskColor(score) {
  if (score >= 10) return '#ef4444'; // red
  if (score >= 6)  return '#f97316'; // orange
  if (score >= 3)  return '#eab308'; // yellow
  return '#22c55e';                  // green
}