import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-ME-in-production';
export const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '30d' });
export const verifyToken = (token) => { try { return jwt.verify(token, SECRET); } catch { return null; } };
export function getUser(req) {
  const auth = req.headers.authorization || '';
  const tok = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return tok ? verifyToken(tok) : null;
}
