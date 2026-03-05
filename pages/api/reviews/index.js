import dbConnect from '../../../lib/mongodb';
import { Review } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const { listingId, sellerUsername, reviewerUsername, limit = 20 } = req.query;
    const f = {};
    if (listingId) f.listingId = listingId;
    if (sellerUsername) f.sellerUsername = sellerUsername;
    if (reviewerUsername) f.reviewerUsername = reviewerUsername;
    const reviews = await Review.find(f).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    return res.json({ reviews });
  }

  if (req.method === 'POST') {
    const me = getUser(req);
    if (!me) return res.status(401).json({ message: 'Not authenticated' });
    const { orderId, sellerUsername, listingId, rating, comment } = req.body;
    if (!sellerUsername || !rating) return res.status(400).json({ message: 'sellerUsername and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    const review = await Review.create({
      orderId, reviewerUsername: me.username, sellerUsername, listingId,
      rating: Number(rating), comment: comment || ''
    });
    return res.status(201).json({ review });
  }

  res.status(405).end();
}
