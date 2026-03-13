// FILE: pages/api/seller/apply.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import SellerApplication from '../../../models/SellerApplication';
import { requireAuth } from '../../../utils/serverAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authResult = requireAuth(req);
  if (!authResult.ok) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    const user = await User.findById(authResult.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'seller') {
      return res.status(400).json({ message: 'You are already a seller.' });
    }

    // Check for existing pending application
    const existing = await SellerApplication.findOne({
      userId: user._id,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application.' });
    }

    const {
      categories, experience, platforms,
      reputation, sourcing, deliverySpeed, discord,
    } = req.body;

    // Capture real IP (works behind Vercel/Nginx)
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';

    const application = await SellerApplication.create({
      userId:      user._id,
      username:    user.username,
      email:       user.email,
      categories:  categories || [],
      experience:  experience || '',
      platforms:   platforms  || '',
      reputation:  reputation || '',
      sourcing:    sourcing   || '',
      deliverySpeed: deliverySpeed || '',
      discord:     discord    || '',
      ipAddress:   ip,
      userAgent:   req.headers['user-agent'] || '',
      status:      'pending',
    });

    // Store reference on user
    user.sellerApplicationId = application._id;
    await user.save();

    return res.status(201).json({ message: 'Application submitted successfully.', applicationId: application._id });
  } catch (err) {
    console.error('[seller/apply]', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
