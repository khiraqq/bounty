import dbConnect from '../../../lib/mongodb';
import { Seller, User } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  const { displayName, description, games, categories } = req.body;
  if (!displayName || !games?.length) return res.status(400).json({ message: 'Display name and at least one game required.' });
  if (await Seller.findOne({ username: me.username })) return res.status(400).json({ message: 'You already have a seller profile.' });
  const seller = await Seller.create({ userId: me.id, username: me.username, displayName, description: description || '', games: Array.isArray(games) ? games : [games], categories: Array.isArray(categories) ? categories : [categories || 'Currency'] });
  await User.updateOne({ username: me.username }, { isSeller: true });
  res.status(201).json({ seller });
}
