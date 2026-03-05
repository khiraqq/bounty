import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required.' });
  if (newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  const user = await User.findOne({ username: me.username });
  if (!user || !user.password) return res.status(400).json({ message: 'Cannot change password for OAuth accounts.' });
  if (!await bcrypt.compare(currentPassword, user.password)) return res.status(401).json({ message: 'Current password is incorrect.' });
  await User.updateOne({ username: me.username }, { password: await bcrypt.hash(newPassword, 10) });
  res.json({ ok: true });
}
