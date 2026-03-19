// FILE: pages/api/seller/apply.js
import { connectDB }              from '../../../lib/mongodb';
import { User, SellerApplication } from '../../../lib/models';
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
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed.' });

  const auth = getAuth(req);
  if (!auth)
    return res.status(401).json({ message: 'You must be logged in to apply.' });

  await connectDB();

  try {
    const user = await User.findById(auth.userId);
    if (!user)
      return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'seller' || user.isSeller)
      return res.status(400).json({ message: 'You are already a seller.' });

    const existing = await SellerApplication.findOne({
      userId: user._id,
      status: { $in: ['pending', 'reviewing'] },
    });
    if (existing)
      return res.status(400).json({ message: 'You already have a pending application.' });

    const {
      categories, experience, platforms,
      reputation, sourcing, deliverySpeed, discord,
    } = req.body;

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
               || req.socket?.remoteAddress || '';

    const application = await SellerApplication.create({
      userId:        user._id,
      username:      user.username,
      email:         user.email || '',
      categories:    categories    || [],
      experience:    experience    || '',
      platforms:     platforms     || '',
      reputation:    reputation    || '',
      sourcing:      sourcing      || '',
      deliverySpeed: deliverySpeed || '',
      discord:       discord       || '',
      ipAddress:     ip,
      userAgent:     req.headers['user-agent'] || '',
      status:        'pending',
    });

    user.sellerApplicationId = application._id;
    await user.save();

    return res.status(201).json({
      message:       'Application submitted successfully.',
      applicationId: application._id,
    });
  } catch (err) {
    console.error('[seller/apply]', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}