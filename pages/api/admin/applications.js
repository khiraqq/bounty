// FILE: pages/api/admin/applications.js
import { connectDB }                        from '../../../lib/mongodb';
import { User, SellerApplication, SystemMessage } from '../../../lib/models';
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

const MESSAGES = {
  reviewing: {
    subject: 'Status Update: Your Application is Under Review',
    body:    'Status Update: Your application is now Under Review.\n\nA member of our staff is currently verifying your submission. You will receive a notification here once the process is complete. Thank you for your patience.',
    subtype: 'application_reviewing',
  },
  approved: {
    subject: 'Congratulations! Your Application has been Approved',
    body:    'Congratulations! Your application has been Approved.\n\nYour account is now fully active, and you have gained access to all marketplace features. You can begin using the platform immediately.',
    subtype: 'application_approved',
  },
  rejected: {
    subject: 'Notice: Your Application has been Declined',
    body:    'Notice: Your application has been Declined.\n\nAfter a manual review by our staff, we have determined that your submission does not meet our current requirements. If you believe this was an error, please ensure all future submissions strictly follow our community guidelines.',
    subtype: 'application_rejected',
  },
};

async function sendSystemMessage(recipientId, templateKey, referenceId = null) {
  const tpl = MESSAGES[templateKey];
  if (!tpl) return;
  await SystemMessage.create({
    recipientId,
    senderId:    null,
    type:        'system',
    subtype:     tpl.subtype,
    subject:     tpl.subject,
    body:        tpl.body,
    referenceId: referenceId || null,
  });
}

async function assertAdmin(req, res) {
  const auth = getAuth(req);
  if (!auth) { res.status(401).json({ message: 'Unauthorized' }); return null; }
  await connectDB();
  const admin = await User.findById(auth.userId).lean();
  const adminOk = admin && (admin.role === 'admin' || admin.isAdmin === true);
  if (!adminOk) { res.status(403).json({ message: 'Forbidden' }); return null; }
  return admin;
}

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method === 'GET') {
    const admin = await assertAdmin(req, res);
    if (!admin) return;
    const { status = 'pending', page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};
    if (status !== 'all') filter.status = status;
    try {
      const [applications, total] = await Promise.all([
        SellerApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        SellerApplication.countDocuments(filter),
      ]);
      return res.status(200).json({ applications, total, page: Number(page) });
    } catch (err) {
      console.error('[admin/applications GET]', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    const admin = await assertAdmin(req, res);
    if (!admin) return;
    if (!['review', 'approve', 'reject'].includes(action))
      return res.status(400).json({ message: 'Invalid action' });

    const { applicationId, notes = '' } = req.body;
    if (!applicationId) return res.status(400).json({ message: 'applicationId required' });

    try {
      const application = await SellerApplication.findById(applicationId);
      if (!application) return res.status(404).json({ message: 'Application not found' });

      if (action === 'review') {
        application.status     = 'reviewing';
        application.reviewedBy = admin._id;
        application.reviewedAt = new Date();
        await application.save();
        await sendSystemMessage(application.userId, 'reviewing', application._id);
        return res.status(200).json({ message: 'Marked as under review. Message sent.' });
      }
      if (action === 'approve') {
        application.status      = 'approved';
        application.reviewedBy  = admin._id;
        application.reviewedAt  = new Date();
        application.reviewNotes = notes;
        await application.save();
        await User.findByIdAndUpdate(application.userId, { role: 'seller', isSeller: true });
        await sendSystemMessage(application.userId, 'approved', application._id);
        return res.status(200).json({ message: 'Application approved. User is now a seller. Message sent.' });
      }
      if (action === 'reject') {
        application.status      = 'rejected';
        application.reviewedBy  = admin._id;
        application.reviewedAt  = new Date();
        application.reviewNotes = notes;
        await application.save();
        await sendSystemMessage(application.userId, 'rejected', application._id);
        return res.status(200).json({ message: 'Application rejected. Message sent.' });
      }
    } catch (err) {
      console.error('[admin/applications POST]', err);
      return res.status(500).json({ message: 'Server error: ' + err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}