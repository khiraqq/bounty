// FILE: pages/api/admin/flag-user.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { requireAuth } from '../../../utils/serverAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const auth = requireAuth(req);
  if (!auth.ok) return res.status(401).json({ message: 'Unauthorized' });

  await dbConnect();
  const admin = await User.findById(auth.userId);
  if (!admin || admin.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { targetUserId, flagged, reason = '' } = req.body;
  if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });

  try {
    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.manualFlagged = !!flagged;
    target.auditLog.push({
      action:    flagged ? 'admin_manual_flag' : 'admin_flag_removed',
      ipAddress: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '',
      details:   reason,
      adminId:   admin._id,
    });
    await target.save();

    return res.status(200).json({ message: `User ${flagged ? 'flagged' : 'unflagged'} successfully.` });
  } catch (err) {
    console.error('[flag-user]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
