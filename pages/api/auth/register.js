// FILE: pages/api/auth/register.js
// Called by Layout.js signup form → POST /api/auth/register
import { connectDB } from '../../../lib/mongodb';
import { User } from '../../../lib/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bounty_dev_secret_change_in_prod';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed.' });

  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });
  if (username.trim().length < 3)
    return res.status(400).json({ message: 'Username must be at least 3 characters.' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  await connectDB();

  try {
    const existing = await User.findOne({ username: username.trim() });
    if (existing)
      return res.status(409).json({ message: 'Username is already taken.' });

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
               req.socket?.remoteAddress || '';

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username:       username.trim(),
      password:       hash,
      role:           'user',
      authMethod:     'password',
      registrationIp: ip,
    });

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, username: user.username });
  } catch (err) {
    console.error('[auth/register]', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}
