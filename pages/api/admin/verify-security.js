// FILE: pages/api/admin/verify-security.js
// Two-layer gateway for the Suspicious Activity dashboard.
// Does NOT expose the answers in the client bundle — validation is server-side only.
// Env vars required:
//   ADMIN_DASHBOARD_PASSWORD  — the admin password (set in .env.local)


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password, securityAnswer } = req.body;

  // ── Layer 1: Password ──────────────────────────────────────────────────────
  const correctPassword = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!correctPassword) {
    console.error('[verify-security] ADMIN_DASHBOARD_PASSWORD env var not set');
    return res.status(500).json({ message: 'Server configuration error' });
  }
  if (!password || password !== correctPassword) {
    return res.status(401).json({ ok: false, field: 'password', message: 'Incorrect admin password.' });
  }

  // ── Layer 2: Security question ─────────────────────────────────────────────
  // Answer is case-sensitive with space: "Raqs Market"
  const CORRECT_ANSWER = 'Raqs Market';
  if (!securityAnswer || securityAnswer.trim() !== CORRECT_ANSWER) {
    return res.status(401).json({ ok: false, field: 'security', message: 'Incorrect security answer.' });
  }

  return res.status(200).json({ ok: true });
}