import dbConnect from '../../../lib/mongodb';
import { Listing } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    const { game, category, sort, page = 1, limit = 24, q, minPrice, maxPrice, online, verified, sellerUsername } = req.query;
    const f = { isActive: true };
    if (game) f.game = game;
    if (category) f.category = category;
    if (sellerUsername) f.sellerUsername = sellerUsername;
    if (q) f.$or = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
    if (minPrice || maxPrice) {
      f.price = {};
      if (minPrice) f.price.$gte = Number(minPrice);
      if (maxPrice) f.price.$lte = Number(maxPrice);
    }
    if (online === '1') f.isSellerOnline = true;
    if (verified === '1') f.isSellerVerified = true;
    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 }, rating: { sellerRating: -1 } };
    const sortObj = sortMap[sort] || { isFeatured: -1, createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(f).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      Listing.countDocuments(f),
    ]);
    return res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  }
  if (req.method === 'POST') {
    const me = getUser(req);
    if (!me) return res.status(401).json({ message: 'Not authenticated' });
    const { game, category, title, description, price, priceUnit, minOrder, maxOrder, deliveryTime, stock } = req.body;
    if (!game || !title || !price) return res.status(400).json({ message: 'game, title and price are required.' });
    const listing = await Listing.create({
      sellerId: me.id, sellerUsername: me.username,
      game, category: category || 'Currency', title, description: description || '',
      price: Number(price), priceUnit: priceUnit || 'per 1000',
      minOrder: Number(minOrder) || 100, maxOrder: Number(maxOrder) || 10000000,
      deliveryTime: deliveryTime || '1-24 hours',
      stock: Number(stock) || 99999,
    });
    return res.status(201).json({ listing });
  }
  res.status(405).end();
}
