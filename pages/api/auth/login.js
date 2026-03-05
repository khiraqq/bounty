import dbConnect from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import { signToken } from '../../../lib/jwt';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });
  const user = await User.findOne({ username });
  if (!user || !user.password) return res.status(401).json({ message: 'Invalid username or password.' });
  if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid username or password.' });
  const token = signToken({ id: user._id.toString(), username: user.username });
  res.status(200).json({ token, user: { username: user.username, email: user.email, balance: user.balance, rank: user.rank, isSeller: user.isSeller } });
}
