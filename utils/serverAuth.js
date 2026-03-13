import { getUser } from '../lib/jwt';

export function requireAuth(req) {
  const payload = getUser(req);
  if (!payload || !payload.id) {
    return { ok: false };
  }
  return {
    ok: true,
    userId: payload.id,
    username: payload.username || '',
  };
}
