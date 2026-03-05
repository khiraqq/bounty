import dbConnect from '../../../lib/mongodb';
import { Seller, Listing, Review } from '../../../lib/models';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  await dbConnect();
  const { username } = req.query;
  const seller = await Seller.findOne({ username }).lean();
  if (!seller) return res.status(404).json({ message: 'Seller not found' });
  const [listings, reviews] = await Promise.all([
    Listing.find({ sellerUsername: username, isActive: true }).lean(),
    Review.find({ sellerUsername: username }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  res.json({ seller, listings, reviews });
}
