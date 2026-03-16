// FILE: pages/api/auth/signup.js
import { connectDB }    from '../../../lib/mongodb';
import { User }         from '../../../lib/models';
import { encodeSession, COOKIE_NAME } from '../../../lib/session';
import bcrypt from 'bcryptjs';

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

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username:   username.trim(),
      password:   hash,
      authMethod: 'password',
    });

    const sessionData = {
      userId:     user._id.toString(),
      username:   user.username,
      authMethod: 'password',
      avatarUrl:  '',
    };

    const token = encodeSession(sessionData);

    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    );

    return res.status(201).json({
      token,
      user: { username: user.username, authMethod: 'password', avatarUrl: '' },
    });
  } catch (err) {
    console.error('[auth/signup]', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}