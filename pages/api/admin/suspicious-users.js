// FILE: pages/api/admin/suspicious-users.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Order from '../../../models/Order';
import { requireAuth } from '../../../utils/auth';
import { calculateRiskScore } from '../../../utils/riskScore';

async function assertAdmin(req, res) {
  const auth = requireAuth(req);
  if (!auth.ok) { res.status(401).json({ message: 'Unauthorized' }); return null; }
  await dbConnect();
  const admin = await User.findById(auth.userId);
  if (!admin || admin.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return null;
  }
  return admin;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const admin = await assertAdmin(req, res);
  if (!admin) return;

  try {
    const { minScore = '1', page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch all users and banned users for IP/wallet comparison
    const [allUsers, bannedUsers, allOrders] = await Promise.all([
      User.find({}).lean(),
      User.find({ status: { $in: ['suspended', 'banned'] } }).lean(),
      Order.find({}).lean(),
    ]);

    // Score every user
    const scored = allUsers.map(user => {
      const userOrders = allOrders.filter(
        o => String(o.buyerId) === String(user._id) || String(o.sellerId) === String(user._id)
      );
      const { score, breakdown } = calculateRiskScore({
        user,
        orders: userOrders,
        allUsers,
        bannedUsers,
        disputes: [], // extend if you have a Dispute model
      });
      return { ...user, riskScore: score, riskBreakdown: breakdown };
    });

    const filtered = scored
      .filter(u => u.riskScore >= Number(minScore))
      .sort((a, b) => b.riskScore - a.riskScore);

    const paginated = filtered.slice(skip, skip + Number(limit));

    // Strip sensitive fields before sending
    const safe = paginated.map(u => ({
      _id:           u._id,
      username:      u.username,
      email:         u.email,
      role:          u.role,
      status:        u.status,
      riskScore:     u.riskScore,
      riskBreakdown: u.riskBreakdown,
      manualFlagged: u.manualFlagged,
      createdAt:     u.createdAt,
      registrationIp: u.registrationIp,
      walletAddresses: u.walletAddresses,
      totalVolume:   u.totalVolume,
    }));

    return res.status(200).json({ users: safe, total: filtered.length, page: Number(page) });
  } catch (err) {
    console.error('[suspicious-users]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}