import { connectDB } from '../../../lib/mongodb';
import { User }      from '../../../lib/models';
import bcrypt from 'bcryptjs';
import jwt   from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bounty_dev_secret_change_in_prod';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed.' });

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  await connectDB();

  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user || !user.password)
      return res.status(401).json({ message: 'Invalid username or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid username or password.' });

    // Issue a real JWT — same format as signup so all API routes can verify it
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        username:   user.username,
        authMethod: user.authMethod,
        avatarUrl:  user.avatarUrl || '',
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
}
