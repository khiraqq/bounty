// FILE: pages/api/admin/me.js
// Used by the admin page to verify the current user is actually an admin.
// Returns 200 + { role } if valid JWT, 401 if no/bad token, 403 if not admin.
import { connectDB } from '../../../lib/mongodb';
import { User }      from '../../../lib/models';
import { requireAuth } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ message: 'Method not allowed.' });

  const auth = requireAuth(req);
  if (!auth.ok)
    return res.status(401).json({ message: 'Unauthorized' });

  await connectDB();

  try {
    const user = await User.findById(auth.userId).select('role username').lean();
    if (!user)
      return res.status(401).json({ message: 'User not found.' });
    if (user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden — admin only.' });

    return res.status(200).json({ role: user.role, username: user.username });
  } catch (err) {
    console.error('[admin/me]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}
