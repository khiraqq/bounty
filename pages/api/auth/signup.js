import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import { signToken } from '../../../lib/jwt';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  const { username, password } = req.body;
  if (!username || username.length < 3) return res.status(400).json({ message: 'Username must be at least 3 characters.' });
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (await User.findOne({ username })) return res.status(400).json({ message: 'Username already taken.' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hash });
  const token = signToken({ id: user._id.toString(), username: user.username });
  res.status(201).json({ token, user: { username: user.username, balance: user.balance, rank: user.rank, isSeller: user.isSeller } });
}
