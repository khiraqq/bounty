// FILE: pages/api/admin/me.js
// Checks whether the current JWT holder is an admin.
// Supports BOTH role:'admin' (string) and isAdmin:true (boolean) for compatibility.
import { connectDB } from '../../../lib/mongodb';
import { User }      from '../../../lib/models';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bounty_dev_secret_change_in_prod';

function getAuth(req) {
  try {
    const header = req.headers.authorization || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : header;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ message: 'Method not allowed.' });

  const auth = getAuth(req);
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });

  await connectDB();

  try {
    const user = await User.findById(auth.userId)
      .select('role isAdmin username')
      .lean();

    if (!user)
      return res.status(401).json({ message: 'User not found.' });

    // Accept EITHER role:'admin' OR isAdmin:true so manual MongoDB edits work
    const isAdmin = user.role === 'admin' || user.isAdmin === true;

    if (!isAdmin)
      return res.status(403).json({ message: 'Forbidden — admin only.' });

    return res.status(200).json({ role: 'admin', username: user.username });
  } catch (err) {
    console.error('[admin/me]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}