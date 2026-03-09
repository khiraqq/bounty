// FILE: pages/api/admin/applications.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import SellerApplication from '../../../models/SellerApplication';
import { requireAuth } from '../../../utils/auth';

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
  const { action } = req.query;

  // GET /api/admin/applications — list
  if (req.method === 'GET') {
    const admin = await assertAdmin(req, res);
    if (!admin) return;

    const { status = 'pending', page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (status !== 'all') filter.status = status;

    const [applications, total] = await Promise.all([
      SellerApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      SellerApplication.countDocuments(filter),
    ]);

    return res.status(200).json({ applications, total, page: Number(page) });
  }

  // POST /api/admin/applications?action=approve|reject
  if (req.method === 'POST') {
    const admin = await assertAdmin(req, res);
    if (!admin) return;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const { applicationId, notes = '' } = req.body;
    if (!applicationId) return res.status(400).json({ message: 'applicationId required' });

    const application = await SellerApplication.findById(applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status      = action === 'approve' ? 'approved' : 'rejected';
    application.reviewedBy  = admin._id;
    application.reviewedAt  = new Date();
    application.reviewNotes = notes;
    await application.save();

    if (action === 'approve') {
      await User.findByIdAndUpdate(application.userId, { role: 'seller' });
    }

    return res.status(200).json({
      message: action === 'approve' ? 'Application approved. User is now a seller.' : 'Application rejected.',
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}