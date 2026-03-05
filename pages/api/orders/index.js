import dbConnect from '../../../lib/mongodb';
import { Order } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  if (req.method === 'GET') {
    const { role } = req.query;
    const f = role === 'seller' ? { sellerUsername: me.username } : { buyerUsername: me.username };
    const orders = await Order.find(f).sort({ createdAt: -1 }).lean();
    return res.json({ orders });
  }
  if (req.method === 'POST') {
    const { listingId, sellerUsername, game, category, title, quantity, price } = req.body;
    const order = await Order.create({ buyerId: me.id, buyerUsername: me.username, sellerUsername, listingId, game, category, title, quantity: Number(quantity) || 1, price: Number(price), total: Number(quantity) * Number(price) });
    return res.status(201).json({ order });
  }
  res.status(405).end();
}
