// FILE: pages/api/admin/user-profile.js
// Returns full user profile for the suspicious activity search panel
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Order from '../../../models/Order';
import Listing from '../../../models/Listing';
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

  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ message: 'Search query too short.' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { username: { $regex: q.trim(), $options: 'i' } },
        { email:    { $regex: q.trim(), $options: 'i' } },
      ],
    }).lean();

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Fetch related data in parallel
    const [orders, listings, allUsers, bannedUsers] = await Promise.all([
      Order.find({
        $or: [{ buyerId: user._id }, { sellerId: user._id }],
      }).sort({ createdAt: -1 }).limit(100).lean(),
      Listing.find({ sellerId: user._id }).sort({ createdAt: -1 }).lean(),
      User.find({}, { passwordHash: 0 }).lean(),
      User.find({ status: { $in: ['suspended', 'banned'] } }).lean(),
    ]);

    const { score, breakdown } = calculateRiskScore({
      user,
      orders,
      allUsers,
      bannedUsers,
      disputes: [],
    });

    const totalVolume = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

    // Active vs deleted listings
    const activeListings  = listings.filter(l => l.status !== 'deleted');
    const deletedListings = listings.filter(l => l.status === 'deleted');

    return res.status(200).json({
      user: {
        _id:             user._id,
        username:        user.username,
        email:           user.email,
        role:            user.role,
        status:          user.status,
        createdAt:       user.createdAt,
        registrationIp:  user.registrationIp,
        loginHistory:    (user.loginHistory || []).slice(-20), // last 20
        walletAddresses: user.walletAddresses || [],
        totalVolume:     totalVolume,
        manualFlagged:   user.manualFlagged,
        disputeCount:    user.disputeCount,
        auditLog:        (user.auditLog || []).slice(-30), // last 30
      },
      riskScore:     score,
      riskBreakdown: breakdown,
      orders:        orders.slice(0, 50).map(o => ({
        _id:         o._id,
        buyerId:     o.buyerId,
        sellerId:    o.sellerId,
        amount:      o.amount,
        status:      o.status,
        escrowStatus: o.escrowStatus || o.status,
        createdAt:   o.createdAt,
        completedAt: o.completedAt,
      })),
      activeListings:  activeListings.map(l => ({ _id: l._id, title: l.title, price: l.price, createdAt: l.createdAt })),
      deletedListings: deletedListings.map(l => ({ _id: l._id, title: l.title, price: l.price, createdAt: l.createdAt })),
    });
  } catch (err) {
    console.error('[user-profile]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}