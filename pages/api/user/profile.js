import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  if (req.method === 'GET') {
    const u = await User.findOne({ username: me.username }).select('-password');
    return u ? res.json({ user: u }) : res.status(404).json({ message: 'Not found' });
  }
  if (req.method === 'POST') {
    const { username, email, description } = req.body;
    const upd = {};
    if (username && username.length >= 3) upd.username = username;
    if (email !== undefined) upd.email = email;
    if (description !== undefined) upd.description = description;
    await User.updateOne({ username: me.username }, upd);
    return res.json({ ok: true });
  }
  res.status(405).end();
}
